//! A decoding worker feeds small PCM packets to Rodio. The device callback only consumes
//! prepared samples; downloads, seeking and CDM calls never run on that callback.
use super::{output::Output, stream::Media, Control, PlayRequest, PlaybackEvent, PlaybackStatus};
use anyhow::{ensure, Result};
use rodio::{buffer::SamplesBuffer, ChannelCount, Decoder, Player, SampleRate, Source};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Condvar, Mutex,
    },
    time::Duration,
};
use tokio_util::sync::CancellationToken;

const PACKET_FRAMES: usize = 2048;
const QUEUED_PACKETS: usize = 12;

struct Clock {
    start: f64,
    samples: Arc<AtomicU64>,
    frequency: u64,
}
struct Controls {
    update: u64,
    paused: bool,
    volume: f32,
    target: f64,
    sink: Option<Arc<Player>>,
    clock: Option<Clock>,
    status: PlaybackStatus,
    error: Option<String>,
}

pub struct Session {
    pub id: String,
    pub cancel: CancellationToken,
    epoch: Arc<AtomicU64>,
    duration: f64,
    controls: Mutex<Controls>,
    changed: Condvar,
    media: Mutex<Option<Media>>,
}

impl Session {
    pub fn new(request: &PlayRequest) -> Self {
        Self {
            id: request.id.clone(),
            cancel: CancellationToken::new(),
            epoch: Arc::new(AtomicU64::new(0)),
            duration: request.duration,
            media: Mutex::new(None),
            changed: Condvar::new(),
            controls: Mutex::new(Controls {
                update: 0,
                paused: request.paused,
                volume: request.volume.clamp(0.0, 1.0),
                target: 0.0,
                sink: None,
                clock: None,
                status: PlaybackStatus::Loading,
                error: None,
            }),
        }
    }

    pub fn stop(&self) {
        self.cancel.cancel();
        let mut controls = self.controls.lock().unwrap();
        if let Some(sink) = controls.sink.take() {
            sink.stop();
        }
        controls.status = PlaybackStatus::Stopped;
        self.notify(&mut controls);
        if let Some(media) = self.media.lock().unwrap().take() {
            media.wake();
        }
    }

    pub fn fail(&self, error: String) {
        if self.cancel.is_cancelled() {
            return;
        }
        let mut controls = self.controls.lock().unwrap();
        if let Some(sink) = controls.sink.take() {
            sink.stop();
        }
        controls.status = PlaybackStatus::Error;
        controls.error = Some(error);
        self.cancel.cancel();
        self.notify(&mut controls);
        if let Some(media) = self.media.lock().unwrap().take() {
            media.wake();
        }
    }

    fn notify(&self, controls: &mut Controls) {
        controls.update = controls.update.wrapping_add(1);
        self.changed.notify_one();
    }

    fn recover_output(&self, epoch: u64) {
        let mut controls = self.controls.lock().unwrap();
        if self.epoch.load(Ordering::Acquire) != epoch || self.cancel.is_cancelled() {
            return;
        }
        if let Some(clock) = controls.clock.take() {
            controls.target =
                clock.start + clock.samples.load(Ordering::Relaxed) as f64 / clock.frequency as f64;
            if self.duration > 0.0 {
                controls.target = controls.target.min(self.duration);
            }
        }
        if let Some(sink) = controls.sink.take() {
            sink.stop();
        }
        controls.status = PlaybackStatus::Loading;
        self.notify(&mut controls);
        log::info!("Reopening audio output at {:.2}s", controls.target);
    }

    /// State transitions wake the reporter immediately; only position updates use a timer.
    pub fn next_event(&self, previous: u64) -> (u64, PlaybackEvent) {
        let controls = self.controls.lock().unwrap();
        let controls = self
            .changed
            .wait_timeout_while(controls, Duration::from_millis(250), |controls| {
                controls.update == previous && !self.cancel.is_cancelled()
            })
            .unwrap()
            .0;
        let position = controls.clock.as_ref().map_or(controls.target, |clock| {
            clock.start + clock.samples.load(Ordering::Relaxed) as f64 / clock.frequency as f64
        });
        (
            controls.update,
            PlaybackEvent {
                id: self.id.clone(),
                status: controls.status,
                position: if self.duration > 0.0 {
                    position.min(self.duration)
                } else {
                    position
                },
                seek_revision: self.epoch.load(Ordering::Acquire),
                duration: self.duration,
                error: controls.error.clone(),
                paused: controls.paused,
            },
        )
    }

    pub fn control(&self, command: Control) -> Result<(), String> {
        if matches!(command, Control::Stop) {
            self.stop();
            return Ok(());
        }
        let mut controls = self.controls.lock().unwrap();
        match command {
            Control::Pause | Control::Resume => {
                controls.paused = matches!(command, Control::Pause);
                if let Some(sink) = &controls.sink {
                    if controls.paused {
                        sink.pause();
                    } else {
                        sink.play();
                    }
                    controls.status = if controls.paused {
                        PlaybackStatus::Paused
                    } else {
                        PlaybackStatus::Playing
                    };
                }
                self.notify(&mut controls);
            }
            Control::Volume(volume) => {
                if !volume.is_finite() {
                    return Err("Invalid volume".into());
                }
                controls.volume = volume.clamp(0.0, 1.0);
                if let Some(sink) = &controls.sink {
                    sink.set_volume(controls.volume);
                }
            }
            Control::Seek {
                position: seconds,
                revision,
            } => {
                if !seconds.is_finite() || seconds < 0.0 {
                    return Err("Invalid seek position".into());
                }
                if revision <= self.epoch.load(Ordering::Acquire) {
                    return Ok(());
                }
                controls.target = if self.duration > 0.0 {
                    seconds.min(self.duration)
                } else {
                    seconds
                };
                controls.clock = None;
                controls.status = PlaybackStatus::Loading;
                if let Some(sink) = controls.sink.take() {
                    sink.stop();
                }
                self.epoch.store(revision, Ordering::Release);
                self.notify(&mut controls);
                if let Some(media) = self.media.lock().unwrap().as_ref() {
                    media.wake();
                }
            }
            Control::Stop => unreachable!(),
        }
        Ok(())
    }
}

pub fn run(session: Arc<Session>, media: Media) {
    *session.media.lock().unwrap() = Some(media.clone());
    let result = decode(&session, &media);
    if let Err(error) = result {
        session.fail(error.to_string());
    }
}

fn decode(session: &Arc<Session>, media: &Media) -> Result<()> {
    let mut output: Option<Output> = None;
    while !session.cancel.is_cancelled() {
        if output.is_none() {
            output = Output::wait(&session.cancel);
            if output.is_none() {
                break;
            }
        }
        let epoch = session.epoch.load(Ordering::Acquire);
        let at = session.controls.lock().unwrap().target;
        let opening = (|| -> Result<_> {
            let (reader, skip) = media.reader(at, session.epoch.clone(), epoch)?;
            let protected = media.protected();
            let mut builder = Decoder::builder()
                .with_data(reader)
                .with_seekable(!protected);
            if let Some(length) = media.byte_len() {
                builder = builder.with_byte_len(length);
            }
            let mut decoder = builder.build()?;
            if !protected && at > 0.0 {
                decoder.try_seek(Duration::from_secs_f64(at))?;
            }
            let channels = decoder.channels();
            let rate = decoder.sample_rate();
            // Apple's CENC encode omits an edit list. Its encoder priming is 2112 frames.
            let skip = if protected {
                if at == 0.0 {
                    2112.0 / rate.get() as f64
                } else {
                    skip
                }
            } else {
                0.0
            };
            let source = decoder.skip_duration(Duration::from_secs_f64(skip));
            let source: Box<dyn Source<Item = f32> + Send> = if session.duration > 0.0 {
                Box::new(
                    source.take_duration(Duration::from_secs_f64((session.duration - at).max(0.0))),
                )
            } else {
                Box::new(source)
            };
            Ok((source, channels, rate))
        })();
        if session.cancel.is_cancelled() {
            break;
        }
        if session.epoch.load(Ordering::Acquire) != epoch {
            continue;
        }
        let (mut source, channels, rate) = opening?;
        let sink = Arc::new(Player::connect_new(output.as_ref().unwrap().mixer()));
        let played = Arc::new(AtomicU64::new(0));
        {
            let mut controls = session.controls.lock().unwrap();
            if session.epoch.load(Ordering::Acquire) != epoch {
                continue;
            }
            sink.set_volume(controls.volume);
            if controls.paused {
                sink.pause();
            }
            controls.sink = Some(sink.clone());
            controls.clock = Some(Clock {
                start: at,
                samples: played.clone(),
                frequency: u64::from(channels.get()) * u64::from(rate.get()),
            });
            controls.status = if controls.paused {
                PlaybackStatus::Paused
            } else {
                PlaybackStatus::Playing
            };
            session.notify(&mut controls);
        }
        loop {
            if session.cancel.is_cancelled() || session.epoch.load(Ordering::Acquire) != epoch {
                sink.stop();
                break;
            }
            if reconnect(session, &mut output, epoch) {
                break;
            }
            if sink.len() >= QUEUED_PACKETS {
                std::thread::sleep(Duration::from_millis(10));
                continue;
            }
            let samples: Vec<f32> = source
                .by_ref()
                .take(PACKET_FRAMES * channels.get() as usize)
                .collect();
            if session.cancel.is_cancelled() || session.epoch.load(Ordering::Acquire) != epoch {
                sink.stop();
                break;
            }
            if samples.is_empty() {
                ensure!(
                    media.error().is_none(),
                    "{}",
                    media.error().unwrap_or_default()
                );
                while !sink.empty()
                    && !session.cancel.is_cancelled()
                    && session.epoch.load(Ordering::Acquire) == epoch
                {
                    if reconnect(session, &mut output, epoch) {
                        break;
                    }
                    std::thread::sleep(Duration::from_millis(10));
                }
                if output.is_none() {
                    break;
                }
                let mut controls = session.controls.lock().unwrap();
                if !session.cancel.is_cancelled() && session.epoch.load(Ordering::Acquire) == epoch
                {
                    controls.status = PlaybackStatus::Ended;
                    session.notify(&mut controls);
                }
                drop(controls);
                // Keep the decoder worker available if a seek races the end notification.
                while !session.cancel.is_cancelled()
                    && session.epoch.load(Ordering::Acquire) == epoch
                {
                    std::thread::sleep(Duration::from_millis(10));
                }
                break;
            }
            // Recheck under the same lock controls use, so a seek cannot be followed by an
            // append of stale audio into a stopped player.
            let _controls = session.controls.lock().unwrap();
            if session.epoch.load(Ordering::Acquire) == epoch && !session.cancel.is_cancelled() {
                sink.append(Packet {
                    input: SamplesBuffer::new(channels, rate, samples),
                    played: played.clone(),
                });
            }
        }
    }
    Ok(())
}

fn reconnect(session: &Session, output: &mut Option<Output>, epoch: u64) -> bool {
    if output.as_mut().is_some_and(Output::changed) {
        session.recover_output(epoch);
        *output = None;
        true
    } else {
        false
    }
}

struct Packet {
    input: SamplesBuffer,
    played: Arc<AtomicU64>,
}
impl Iterator for Packet {
    type Item = f32;
    fn next(&mut self) -> Option<f32> {
        let sample = self.input.next()?;
        self.played.fetch_add(1, Ordering::Relaxed);
        Some(sample)
    }
}
impl Source for Packet {
    fn current_span_len(&self) -> Option<usize> {
        self.input.current_span_len()
    }
    fn channels(&self) -> ChannelCount {
        self.input.channels()
    }
    fn sample_rate(&self) -> SampleRate {
        self.input.sample_rate()
    }
    fn total_duration(&self) -> Option<Duration> {
        self.input.total_duration()
    }
}
