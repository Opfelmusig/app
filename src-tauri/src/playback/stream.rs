//! An arriving track held in memory. Decoder reads wait for complete fragments and decrypt
//! only the samples they touch. Cancellation and seeking wake blocked reads.
use super::cenc::{self, Fragment, Track};
use crate::drm::Cdm;
use anyhow::{ensure, Context, Result};
use std::{
    io::{self, Read, Seek, SeekFrom},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Condvar, Mutex,
    },
    time::Duration,
};
use tokio_util::sync::CancellationToken;

const MAX_BYTES: usize = 256 * 1024 * 1024;
const PREROLL: usize = 256 * 1024;

struct Buffer {
    bytes: Vec<u8>,
    scanned: usize,
    header: usize,
    track: Option<Track>,
    fragments: Vec<Fragment>,
    cdm: Option<Arc<Cdm>>,
    key_id: [u8; 16],
    protected: bool,
    done: bool,
    error: Option<String>,
}

impl Buffer {
    fn index(&mut self) -> Result<()> {
        if !self.protected {
            self.scanned = self.bytes.len();
            return Ok(());
        }
        while let Some(info) = cenc::box_at(&self.bytes, self.scanned)? {
            match &info.kind {
                b"moov" => {
                    ensure!(self.track.is_none(), "Duplicate MP4 header");
                    self.track = Some(cenc::initialise(&mut self.bytes, info)?);
                    self.header = info.end;
                }
                b"moof" => {
                    let Some(media) = cenc::box_at(&self.bytes, info.end)? else {
                        break;
                    };
                    let track = self
                        .track
                        .as_ref()
                        .context("MP4 fragment arrived before its header")?;
                    self.fragments
                        .push(cenc::fragment(&self.bytes, info, media, track)?);
                    self.scanned = media.end;
                    continue;
                }
                b"mdat" => anyhow::bail!("Media arrived without encryption metadata"),
                _ => {}
            }
            self.scanned = info.end;
        }
        Ok(())
    }

    fn clear(&mut self, range: std::ops::Range<usize>) -> Result<()> {
        if !self.protected {
            return Ok(());
        }
        let cdm = self.cdm.as_ref().context("Track has no licence")?;
        for fragment in &mut self.fragments {
            if fragment
                .samples
                .last()
                .is_some_and(|s| s.bytes.end <= range.start)
            {
                continue;
            }
            for sample in &mut fragment.samples {
                if sample.bytes.start >= range.end {
                    break;
                }
                if sample.bytes.end > range.start && !sample.clear {
                    cdm.decrypt(
                        &mut self.bytes[sample.bytes.clone()],
                        &self.key_id,
                        &sample.iv,
                        &sample.subs,
                    )?;
                    sample.clear = true;
                }
            }
        }
        Ok(())
    }
}

struct Shared {
    buffer: Mutex<Buffer>,
    changed: Condvar,
    cancel: CancellationToken,
}
#[derive(Clone)]
pub struct Media(Arc<Shared>);

impl Media {
    pub fn start(
        mut response: reqwest::Response,
        protected: bool,
        cancel: CancellationToken,
    ) -> Self {
        let media = Self(Arc::new(Shared {
            buffer: Mutex::new(Buffer {
                bytes: Vec::new(),
                scanned: 0,
                header: 0,
                track: None,
                fragments: Vec::new(),
                cdm: None,
                key_id: [0; 16],
                protected,
                done: false,
                error: None,
            }),
            changed: Condvar::new(),
            cancel,
        }));
        let weak = Arc::downgrade(&media.0);
        let cancellation = media.0.cancel.clone();
        tauri::async_runtime::spawn(async move {
            loop {
                let chunk = cancellation.run_until_cancelled(response.chunk()).await;
                let Some(shared) = weak.upgrade() else {
                    return;
                };
                let mut buffer = shared.buffer.lock().unwrap();
                match chunk {
                    Some(Ok(Some(chunk))) if buffer.bytes.len() + chunk.len() <= MAX_BYTES => {
                        buffer.bytes.extend_from_slice(&chunk);
                        if let Err(error) = buffer.index() {
                            buffer.error = Some(error.to_string());
                            buffer.done = true;
                        }
                    }
                    Some(Ok(None)) => {
                        buffer.done = true;
                        if protected && buffer.scanned != buffer.bytes.len() {
                            buffer.error = Some("Truncated protected audio".into());
                        }
                    }
                    Some(Err(error)) => {
                        buffer.error =
                            Some(format!("Audio download failed: {}", error.without_url()));
                        buffer.done = true;
                    }
                    Some(Ok(Some(_))) => {
                        buffer.error = Some("Audio exceeds the memory limit".into());
                        buffer.done = true;
                    }
                    None => {
                        buffer.done = true;
                    }
                }
                shared.changed.notify_all();
                if buffer.done {
                    break;
                }
            }
        });
        media
    }

    pub fn license(&self, cdm: Cdm, key_id: [u8; 16]) {
        let mut buffer = self.0.buffer.lock().unwrap();
        buffer.cdm = Some(Arc::new(cdm));
        buffer.key_id = key_id;
    }

    pub fn prime(&self) -> Result<()> {
        let mut buffer = self.0.buffer.lock().unwrap();
        loop {
            ensure!(!self.0.cancel.is_cancelled(), "Playback cancelled");
            ensure!(
                buffer.error.is_none(),
                "{}",
                buffer.error.as_deref().unwrap_or_default()
            );
            let ready = if buffer.protected {
                buffer.header > 0
                    && !buffer.fragments.is_empty()
                    && (buffer.bytes.len() >= buffer.header + PREROLL || buffer.done)
            } else {
                buffer.bytes.len() >= PREROLL || buffer.done
            };
            if ready {
                return Ok(());
            }
            ensure!(!buffer.done, "Track has no playable audio");
            buffer = self
                .0
                .changed
                .wait_timeout(buffer, Duration::from_millis(100))
                .unwrap()
                .0;
        }
    }

    pub fn reader(
        &self,
        seconds: f64,
        epoch: Arc<AtomicU64>,
        expected: u64,
    ) -> Result<(Reader, f64)> {
        let mut buffer = self.0.buffer.lock().unwrap();
        let (graft, skip) = if buffer.protected && seconds > 0.0 {
            loop {
                ensure!(
                    !self.0.cancel.is_cancelled() && epoch.load(Ordering::Acquire) == expected,
                    "Playback interrupted"
                );
                ensure!(
                    buffer.error.is_none(),
                    "{}",
                    buffer.error.as_deref().unwrap_or_default()
                );
                if let Some(fragment) = buffer.fragments.iter().rev().find(|fragment| {
                    seconds >= fragment.seconds
                        && (seconds < fragment.seconds + fragment.duration || buffer.done)
                }) {
                    break (fragment.bytes, seconds - fragment.seconds);
                }
                ensure!(!buffer.done, "Seek position is outside the track");
                buffer = self
                    .0
                    .changed
                    .wait_timeout(buffer, Duration::from_millis(100))
                    .unwrap()
                    .0;
            }
        } else {
            (buffer.header, 0.0)
        };
        Ok((
            Reader {
                media: self.clone(),
                position: 0,
                header: buffer.header,
                graft,
                epoch,
                expected,
            },
            skip,
        ))
    }

    pub fn protected(&self) -> bool {
        self.0.buffer.lock().unwrap().protected
    }
    pub fn error(&self) -> Option<String> {
        self.0.buffer.lock().unwrap().error.clone()
    }
    pub fn wake(&self) {
        self.0.changed.notify_all();
    }
}

pub struct Reader {
    media: Media,
    position: usize,
    header: usize,
    graft: usize,
    epoch: Arc<AtomicU64>,
    expected: u64,
}
impl Read for Reader {
    fn read(&mut self, out: &mut [u8]) -> io::Result<usize> {
        if out.is_empty() {
            return Ok(0);
        }
        let mut buffer = self.media.0.buffer.lock().unwrap();
        loop {
            if self.media.0.cancel.is_cancelled()
                || self.epoch.load(Ordering::Acquire) != self.expected
            {
                return Err(io::Error::other("Playback interrupted"));
            }
            if let Some(error) = &buffer.error {
                return Err(io::Error::other(error.clone()));
            }
            let physical = if self.position < self.header {
                self.position
            } else {
                self.graft
                    .checked_add(self.position - self.header)
                    .ok_or_else(|| io::Error::other("Audio position overflow"))?
            };
            if physical < buffer.scanned {
                let end = physical.saturating_add(out.len()).min(buffer.scanned).min(
                    if self.position < self.header {
                        self.header
                    } else {
                        usize::MAX
                    },
                );
                if let Err(error) = buffer.clear(physical..end) {
                    buffer.error = Some(error.to_string());
                    return Err(io::Error::other(error.to_string()));
                }
                let len = end - physical;
                out[..len].copy_from_slice(&buffer.bytes[physical..end]);
                self.position += len;
                return Ok(len);
            }
            if buffer.done {
                return Ok(0);
            }
            buffer = self
                .media
                .0
                .changed
                .wait_timeout(buffer, Duration::from_millis(100))
                .unwrap()
                .0;
        }
    }
}

impl Seek for Reader {
    fn seek(&mut self, seek: SeekFrom) -> io::Result<u64> {
        let position = match seek {
            SeekFrom::Start(at) => i128::from(at),
            SeekFrom::Current(delta) => self.position as i128 + i128::from(delta),
            // Decoder tail probes must not wait for the entire network response.
            SeekFrom::End(delta) => {
                let buffer = self.media.0.buffer.lock().unwrap();
                (buffer.bytes.len() - self.graft + self.header) as i128 + i128::from(delta)
            }
        };
        self.position =
            usize::try_from(position).map_err(|_| io::Error::other("Invalid audio seek"))?;
        Ok(self.position as u64)
    }
}
