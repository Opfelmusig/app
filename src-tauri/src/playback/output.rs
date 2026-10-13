use anyhow::{Context, Result};
use rodio::{
    cpal::{
        self,
        traits::{DeviceTrait, HostTrait},
    },
    mixer::Mixer,
    DeviceSinkBuilder, MixerDeviceSink,
};
use std::{
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    time::{Duration, Instant},
};
use tokio_util::sync::CancellationToken;

const POLL: Duration = Duration::from_secs(1);

pub struct Output {
    stream: MixerDeviceSink,
    device: Option<cpal::DeviceId>,
    failed: Arc<AtomicBool>,
    checked: Instant,
}

impl Output {
    fn open() -> Result<Self> {
        let device = cpal::default_host()
            .default_output_device()
            .context("No audio output device")?;
        let id = device.id().ok();
        let failed = Arc::new(AtomicBool::new(false));
        let errors = failed.clone();
        let mut stream = DeviceSinkBuilder::from_device(device)?
            .with_error_callback(move |error| {
                if !matches!(error, cpal::StreamError::BufferUnderrun) {
                    errors.store(true, Ordering::Release);
                }
            })
            .open_sink_or_fallback()?;
        stream.log_on_drop(false);
        Ok(Self {
            stream,
            device: id,
            failed,
            checked: Instant::now(),
        })
    }

    pub fn wait(cancel: &CancellationToken) -> Option<Self> {
        let mut warned = false;
        while !cancel.is_cancelled() {
            match Self::open() {
                Ok(output) => return Some(output),
                Err(cause) if !warned => {
                    log::warn!("Waiting for audio output: {cause}");
                    warned = true;
                }
                Err(_) => {}
            }
            std::thread::sleep(POLL);
        }
        None
    }

    pub fn changed(&mut self) -> bool {
        if self.failed.load(Ordering::Acquire) {
            return true;
        }
        if self.checked.elapsed() < POLL {
            return false;
        }
        self.checked = Instant::now();
        cpal::default_host()
            .default_output_device()
            .is_none_or(|device| device.id().ok() != self.device)
    }

    pub fn mixer(&self) -> &Mixer {
        self.stream.mixer()
    }
}
