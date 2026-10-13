use rodio::{source::UniformSourceIterator, ChannelCount, SampleRate, Source};
use serde::Deserialize;
use std::{sync::mpsc::Receiver, time::Duration};

const FREQUENCIES: [f64; 10] = [
    32., 64., 125., 250., 500., 1000., 2000., 4000., 8000., 16000.,
];
const FLAT: [f64; 5] = [1., 0., 0., 0., 0.];

#[derive(Deserialize)]
pub struct Loudness {
    value: f64,
    peak: Option<f64>,
}

/// Missing analysis leaves the original gain; never boost without a known peak.
pub fn normalization(loudness: Option<&Loudness>) -> f64 {
    let Some(loudness) = loudness
        .filter(|loudness| loudness.value.is_finite() && (-70.0..0.0).contains(&loudness.value))
    else {
        return 1.0;
    };
    let headroom = loudness
        .peak
        .filter(|peak| peak.is_finite() && (-100.0..=20.0).contains(peak))
        .map_or(1.0, |dbfs| 10f64.powf(-dbfs / 20.).min(4.0));
    10f64.powf((-14.0 - loudness.value) / 20.).min(headroom)
}

#[derive(Clone, Deserialize)]
pub struct Equalizer {
    pub enabled: bool,
    pub gains: [f64; 10],
}

#[derive(Clone, Deserialize)]
pub struct Settings {
    pub normalization: bool,
    pub equalizer: Equalizer,
}

impl Settings {
    pub fn validate(&mut self) -> Result<(), String> {
        for gain in &mut self.equalizer.gains {
            if !gain.is_finite() {
                return Err("Invalid equalizer gain".into());
            }
            *gain = gain.clamp(-12., 12.);
        }
        Ok(())
    }

    pub fn parameters(&self, rate: SampleRate, normalization: f64) -> Parameters {
        let gains = if self.equalizer.enabled {
            self.equalizer.gains
        } else {
            [0.; 10]
        };
        // Leave headroom for boosted bands, independently of track normalization.
        let boost = gains.iter().copied().fold(0., f64::max);
        Parameters {
            filters: std::array::from_fn(|band| {
                peaking(FREQUENCIES[band], gains[band], rate.get())
            }),
            gain: 10f64.powf(-boost / 20.)
                * if self.normalization {
                    normalization
                } else {
                    1.
                },
        }
    }
}

#[derive(Clone, Copy, PartialEq)]
pub struct Parameters {
    filters: [[f64; 5]; 10],
    gain: f64,
}

// RBJ peaking biquad coefficients, with a0 normalized away and one-octave bands.
fn peaking(frequency: f64, gain: f64, rate: u32) -> [f64; 5] {
    if gain == 0. || frequency >= f64::from(rate) * 0.475 {
        return FLAT;
    }
    let amplitude = 10f64.powf(gain / 40.);
    let (sin, cos) = (std::f64::consts::TAU * frequency / f64::from(rate)).sin_cos();
    let alpha = sin / (2. * std::f64::consts::SQRT_2);
    let a0 = 1. + alpha / amplitude;
    [
        (1. + alpha * amplitude) / a0,
        -2. * cos / a0,
        (1. - alpha * amplitude) / a0,
        -2. * cos / a0,
        (1. - alpha / amplitude) / a0,
    ]
}

/// Owns filter state across queued PCM packets. Updates arrive through a channel;
/// the audio callback never locks settings or calculates filter coefficients.
pub struct Processed<S: Source> {
    input: UniformSourceIterator<S>,
    updates: Receiver<Parameters>,
    current: Parameters,
    target: Parameters,
    delays: Vec<[[f64; 2]; 10]>,
    channel: usize,
    frame: u32,
    remaining: u32,
    ramp: u32,
    active: bool,
}

impl<S: Source> Processed<S> {
    pub fn new(
        input: S,
        channels: ChannelCount,
        rate: SampleRate,
        initial: Parameters,
        updates: Receiver<Parameters>,
    ) -> Self {
        Self {
            input: UniformSourceIterator::new(input, channels, rate),
            updates,
            current: initial,
            target: initial,
            delays: vec![[[0.; 2]; 10]; channels.get() as usize],
            channel: 0,
            frame: 0,
            remaining: 0,
            ramp: (rate.get() / 25).max(1), // 40 ms
            active: initial.filters.iter().any(|filter| *filter != FLAT),
        }
    }

    fn advance(&mut self) {
        // Pick up the latest settings about every 5 ms at common sample rates.
        if self.frame.is_multiple_of(256) {
            if let Some(target) = self.updates.try_iter().last() {
                if target != self.target {
                    self.target = target;
                    self.remaining = self.ramp;
                    self.active |= target.filters.iter().any(|filter| *filter != FLAT);
                }
            }
        }
        self.frame = self.frame.wrapping_add(1);
        if self.remaining == 0 {
            return;
        }
        let fraction = 1. / f64::from(self.remaining);
        for (current, target) in self.current.filters.iter_mut().zip(self.target.filters) {
            for (value, target) in current.iter_mut().zip(target) {
                *value += (target - *value) * fraction;
            }
        }
        self.current.gain += (self.target.gain - self.current.gain) * fraction;
        self.remaining -= 1;
        if self.remaining == 0 {
            self.current = self.target;
            self.active = self.current.filters.iter().any(|filter| *filter != FLAT);
            for (band, filter) in self.current.filters.iter().enumerate() {
                if *filter == FLAT {
                    for channel in &mut self.delays {
                        channel[band] = [0.; 2];
                    }
                }
            }
        }
    }
}

impl<S: Source> Iterator for Processed<S> {
    type Item = f32;
    fn next(&mut self) -> Option<f32> {
        let sample = self.input.next()?;
        if self.channel == 0 {
            self.advance();
        }
        let mut sample = f64::from(sample);
        if self.active {
            for (coefficients, delay) in self
                .current
                .filters
                .iter()
                .zip(&mut self.delays[self.channel])
            {
                if *coefficients == FLAT {
                    continue;
                }
                let [b0, b1, b2, a1, a2] = *coefficients;
                let output = b0 * sample + delay[0];
                delay[0] = b1 * sample - a1 * output + delay[1];
                delay[1] = b2 * sample - a2 * output;
                sample = output;
            }
        }
        self.channel = (self.channel + 1) % self.delays.len();
        Some((sample * self.current.gain) as f32)
    }
}

impl<S: Source> Source for Processed<S> {
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
