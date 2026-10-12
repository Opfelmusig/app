//! Small ISO-BMFF reader for Apple's CENC AAC fragments. All offsets are checked before use.
use anyhow::{ensure, Context, Result};
use std::ops::Range;

#[derive(Clone, Copy)]
pub struct BoxInfo {
    pub kind: [u8; 4],
    pub start: usize,
    pub body: usize,
    pub end: usize,
}

pub fn box_at(data: &[u8], at: usize) -> Result<Option<BoxInfo>> {
    let Some(head) = data.get(at..).filter(|bytes| bytes.len() >= 8) else {
        return Ok(None);
    };
    let short = u32::from_be_bytes(head[..4].try_into()?);
    let (size, header) = match short {
        0 => anyhow::bail!("Unbounded MP4 boxes are unsupported"),
        1 if head.len() < 16 => return Ok(None),
        1 => (
            usize::try_from(u64::from_be_bytes(head[8..16].try_into()?))?,
            16,
        ),
        _ => (short as usize, 8),
    };
    ensure!(size >= header, "Invalid MP4 box size");
    let end = at.checked_add(size).context("MP4 box overflow")?;
    if end > data.len() {
        return Ok(None);
    }
    Ok(Some(BoxInfo {
        kind: head[4..8].try_into()?,
        start: at,
        body: at + header,
        end,
    }))
}

fn boxes(data: &[u8], range: Range<usize>) -> Result<Vec<BoxInfo>> {
    ensure!(range.end <= data.len(), "Truncated MP4 container");
    let mut at = range.start;
    let mut out = Vec::new();
    while at < range.end {
        let value = box_at(&data[..range.end], at)?.context("Truncated MP4 child box")?;
        at = value.end;
        out.push(value);
    }
    Ok(out)
}

fn child(data: &[u8], parent: BoxInfo, kind: &[u8; 4]) -> Result<BoxInfo> {
    boxes(data, parent.body..parent.end)?
        .into_iter()
        .find(|value| &value.kind == kind)
        .with_context(|| format!("Missing MP4 {} box", String::from_utf8_lossy(kind)))
}

fn word(data: &[u8], at: usize) -> Result<u32> {
    Ok(u32::from_be_bytes(
        data.get(at..at + 4)
            .context("Truncated MP4 field")?
            .try_into()?,
    ))
}
fn long(data: &[u8], at: usize) -> Result<u64> {
    Ok(u64::from_be_bytes(
        data.get(at..at + 8)
            .context("Truncated MP4 field")?
            .try_into()?,
    ))
}

pub struct Track {
    id: u32,
    iv_size: usize,
    pub timescale: u32,
}
pub struct Sample {
    pub bytes: Range<usize>,
    pub iv: [u8; 16],
    pub subs: Vec<(u32, u32)>,
    pub clear: bool,
}
pub struct Fragment {
    pub bytes: usize,
    pub seconds: f64,
    pub duration: f64,
    pub samples: Vec<Sample>,
}

pub fn initialise(data: &mut [u8], moov: BoxInfo) -> Result<Track> {
    for trak in boxes(data, moov.body..moov.end)?
        .into_iter()
        .filter(|b| &b.kind == b"trak")
    {
        let tkhd = child(data, trak, b"tkhd")?;
        let id = word(
            &data[..tkhd.end],
            tkhd.body
                + if word(&data[..tkhd.end], tkhd.body)? >> 24 == 1 {
                    20
                } else {
                    12
                },
        )?;
        let mdia = child(data, trak, b"mdia")?;
        let mdhd = child(data, mdia, b"mdhd")?;
        let timescale = word(
            &data[..mdhd.end],
            mdhd.body
                + if word(&data[..mdhd.end], mdhd.body)? >> 24 == 1 {
                    20
                } else {
                    12
                },
        )?;
        let minf = child(data, mdia, b"minf")?;
        let stbl = child(data, minf, b"stbl")?;
        let stsd = child(data, stbl, b"stsd")?;
        let entries = boxes(data, stsd.body + 8..stsd.end)?;
        if let Some(entry) = entries.into_iter().find(|b| &b.kind == b"enca") {
            let sinf = boxes(data, entry.body + 28..entry.end)?
                .into_iter()
                .find(|b| &b.kind == b"sinf")
                .context("CENC protection info missing")?;
            let schi = child(data, sinf, b"schi")?;
            let tenc = child(data, schi, b"tenc")?;
            let iv_size = *data
                .get(tenc.body + 7)
                .filter(|_| tenc.body + 7 < tenc.end)
                .context("CENC IV size missing")? as usize;
            ensure!(
                timescale > 0 && matches!(iv_size, 8 | 16),
                "Unsupported CENC track"
            );
            data[entry.start + 4..entry.start + 8].copy_from_slice(b"mp4a");
            return Ok(Track {
                id,
                iv_size,
                timescale,
            });
        }
    }
    anyhow::bail!("No encrypted AAC track in the MP4 header")
}

pub fn fragment(data: &[u8], moof: BoxInfo, mdat: BoxInfo, track: &Track) -> Result<Fragment> {
    ensure!(
        &mdat.kind == b"mdat",
        "MP4 fragment is not followed by media"
    );
    for traf in boxes(data, moof.body..moof.end)?
        .into_iter()
        .filter(|b| &b.kind == b"traf")
    {
        let tfhd = child(data, traf, b"tfhd")?;
        let header = &data[..tfhd.end];
        if word(header, tfhd.body + 4)? != track.id {
            continue;
        }
        let flags = word(header, tfhd.body)? & 0x00ff_ffff;
        let mut at = tfhd.body + 8;
        let base = if flags & 1 != 0 {
            let base = long(header, at)?;
            at += 8;
            usize::try_from(base)?
        } else {
            moof.start
        };
        if flags & 2 != 0 {
            at += 4;
        }
        let default_duration = if flags & 8 != 0 {
            let value = word(header, at)?;
            at += 4;
            value
        } else {
            1024
        };
        let default_size = if flags & 16 != 0 {
            word(header, at)?
        } else {
            0
        };
        let tfdt = child(data, traf, b"tfdt")?;
        let time = if word(&data[..tfdt.end], tfdt.body)? >> 24 == 1 {
            long(&data[..tfdt.end], tfdt.body + 4)?
        } else {
            word(&data[..tfdt.end], tfdt.body + 4)? as u64
        };
        let trun = child(data, traf, b"trun")?;
        let run = &data[..trun.end];
        let flags = word(run, trun.body)? & 0x00ff_ffff;
        let count = word(run, trun.body + 4)? as usize;
        ensure!(count > 0 && count <= 1_000_000, "Invalid CENC sample count");
        let mut at = trun.body + 8;
        let mut offset = if flags & 1 != 0 {
            let relative = word(run, at)? as i32 as i64;
            at += 4;
            usize::try_from(
                (base as i64)
                    .checked_add(relative)
                    .context("Sample offset overflow")?,
            )?
        } else {
            mdat.body
        };
        if flags & 4 != 0 {
            at += 4;
        }
        let mut ranges = Vec::new();
        let mut ticks = 0u64;
        for _ in 0..count {
            ticks += if flags & 0x100 != 0 {
                let v = word(run, at)?;
                at += 4;
                v
            } else {
                default_duration
            } as u64;
            let size = if flags & 0x200 != 0 {
                let v = word(run, at)?;
                at += 4;
                v
            } else {
                default_size
            } as usize;
            if flags & 0x400 != 0 {
                at += 4;
            }
            if flags & 0x800 != 0 {
                at += 4;
            }
            ensure!(at <= trun.end, "Truncated sample table");
            let end = offset.checked_add(size).context("Sample size overflow")?;
            ensure!(
                size > 0 && offset >= mdat.body && end <= mdat.end,
                "Sample outside its media fragment"
            );
            ranges.push(offset..end);
            offset = end;
        }
        let senc = child(data, traf, b"senc")?;
        let encrypted = &data[senc.body..senc.end];
        // Some Apple assets declare a different IV size than the one in senc. Accept only
        // a layout that accounts for the complete senc box and every declared sample.
        let ivs = encryption(encrypted, count, track.iv_size)
            .or_else(|_| encryption(encrypted, count, if track.iv_size == 8 { 16 } else { 8 }))?;
        let samples = ranges
            .into_iter()
            .zip(ivs)
            .map(|(bytes, (iv, subs))| Sample {
                bytes,
                iv,
                subs,
                clear: false,
            })
            .collect();
        return Ok(Fragment {
            bytes: moof.start,
            seconds: time as f64 / track.timescale as f64,
            duration: ticks as f64 / track.timescale as f64,
            samples,
        });
    }
    anyhow::bail!("Fragment has no encrypted audio track")
}

type Encryption = ([u8; 16], Vec<(u32, u32)>);
fn encryption(data: &[u8], count: usize, iv_size: usize) -> Result<Vec<Encryption>> {
    let flags = word(data, 0)? & 0x00ff_ffff;
    ensure!(
        flags & !2 == 0 && word(data, 4)? as usize == count,
        "Unsupported CENC encryption table"
    );
    let mut at = 8;
    let mut out = Vec::new();
    for _ in 0..count {
        let mut iv = [0; 16];
        iv[..iv_size].copy_from_slice(data.get(at..at + iv_size).context("Truncated sample IV")?);
        at += iv_size;
        let mut subs = Vec::new();
        if flags & 2 != 0 {
            let count = u16::from_be_bytes(
                data.get(at..at + 2)
                    .context("Truncated subsample count")?
                    .try_into()?,
            );
            at += 2;
            for _ in 0..count {
                let clear = u16::from_be_bytes(
                    data.get(at..at + 2)
                        .context("Truncated subsample")?
                        .try_into()?,
                ) as u32;
                let cipher = word(data, at + 2)?;
                at += 6;
                subs.push((clear, cipher));
            }
        }
        out.push((iv, subs));
    }
    ensure!(at == data.len(), "CENC encryption table length mismatch");
    Ok(out)
}
