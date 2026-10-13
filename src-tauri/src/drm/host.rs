//! The proprietary CDM runs in a child process. Only challenges, licences and audio samples
//! cross the pipes; device credentials and content keys stay inside the module.
use anyhow::{bail, ensure, Context, Result};
use std::{
    ffi::{c_char, c_int, CStr, CString},
    io::{self, BufReader, BufWriter, Read, Write},
    path::Path,
    process::{Child, ChildStdin, ChildStdout, Command, Stdio},
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc, Arc, Mutex,
    },
    time::{Duration, Instant},
};

const HOST_ARG: &str = "--widevine-host";
const LIMIT: usize = 16 * 1024 * 1024;
const TIMEOUT: Duration = Duration::from_secs(10);
const MISSING_KEY: u8 = 33;

extern "C" {
    fn ch_open(path: *const c_char) -> c_int;
    fn ch_load_error() -> *const c_char;
    fn ch_challenge(data: *const u8, len: u32, out: *mut *mut u8, out_len: *mut u32) -> c_int;
    fn ch_update(data: *const u8, len: u32) -> c_int;
    fn ch_tick();
    fn ch_timer_delay() -> i64;
    fn ch_status(out: *mut *mut u8, out_len: *mut u32) -> c_int;
    fn ch_decrypt(
        data: *const u8,
        len: u32,
        kid: *const u8,
        kid_len: u32,
        iv: *const u8,
        iv_len: u32,
        subs: *const u32,
        num_subs: u32,
        out: *mut *mut u8,
        out_len: *mut u32,
    ) -> c_int;
    fn ch_free(data: *mut u8);
}

#[derive(Debug)]
pub struct MissingKey;

impl std::fmt::Display for MissingKey {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("Playback decryption key is unavailable")
    }
}
impl std::error::Error for MissingKey {}

pub struct LicenseStatus {
    pub expired: bool,
    pub renewal: Option<Vec<u8>>,
}

fn read_frame(from: &mut impl Read) -> io::Result<(u8, Vec<u8>)> {
    let mut head = [0; 5];
    from.read_exact(&mut head)?;
    let len = u32::from_le_bytes(head[1..].try_into().unwrap()) as usize;
    if len > LIMIT {
        return Err(io::Error::other("CDM frame is too large"));
    }
    let mut payload = vec![0; len];
    from.read_exact(&mut payload)?;
    Ok((head[0], payload))
}

fn write_frame(to: &mut impl Write, op: u8, payload: &[u8]) -> io::Result<()> {
    if payload.len() > LIMIT {
        return Err(io::Error::other("CDM frame is too large"));
    }
    to.write_all(&[op])?;
    to.write_all(&(payload.len() as u32).to_le_bytes())?;
    to.write_all(payload)?;
    to.flush()
}

/// Returns true in helper mode, before Tauri or its logging/instance plugins start.
pub fn run_host() -> bool {
    let mut args = std::env::args_os().skip(1);
    if args.next().as_deref() != Some(std::ffi::OsStr::new(HOST_ARG)) {
        return false;
    }
    let result = (|| -> Result<()> {
        let path = args.next().context("CDM path is missing")?;
        let path = CString::new(path.to_str().context("CDM path is not UTF-8")?)?;
        let code = unsafe { ch_open(path.as_ptr()) };
        if code != 0 {
            let reason = if code == 1 {
                unsafe { CStr::from_ptr(ch_load_error()) }
                    .to_string_lossy()
                    .into_owned()
            } else {
                format!("CDM initialisation failed ({code})")
            };
            bail!("{reason}");
        }
        // Keep every CDM call on this thread. Pipe reads must not prevent timers firing.
        let (send, receive) = mpsc::sync_channel(1);
        std::thread::spawn(move || {
            let mut input = BufReader::new(io::stdin().lock());
            loop {
                let frame = read_frame(&mut input);
                let done = frame.is_err();
                if send.send(frame).is_err() || done {
                    break;
                }
            }
        });
        let mut output = BufWriter::new(io::stdout().lock());
        write_frame(&mut output, 0, b"opfelmusig-cdm/1")?;
        loop {
            unsafe { ch_tick() };
            let delay = unsafe { ch_timer_delay() };
            let incoming = if delay < 0 {
                receive
                    .recv()
                    .map_err(|_| mpsc::RecvTimeoutError::Disconnected)
            } else {
                receive.recv_timeout(Duration::from_millis(delay as u64))
            };
            let (op, payload) = match incoming {
                Ok(Ok(frame)) => frame,
                Ok(Err(error)) if error.kind() == io::ErrorKind::UnexpectedEof => break,
                Ok(Err(error)) => return Err(error.into()),
                Err(mpsc::RecvTimeoutError::Timeout) => continue,
                Err(mpsc::RecvTimeoutError::Disconnected) => break,
            };
            match execute(op, &payload) {
                Ok(bytes) => write_frame(&mut output, 0, &bytes)?,
                Err(error) => write_frame(
                    &mut output,
                    if error.is::<MissingKey>() {
                        MISSING_KEY
                    } else {
                        1
                    },
                    error.to_string().as_bytes(),
                )?,
            }
        }
        Ok(())
    })();
    if let Err(error) = result {
        eprintln!("Widevine host: {error}");
        std::process::exit(1);
    }
    true
}

fn execute(op: u8, payload: &[u8]) -> Result<Vec<u8>> {
    let mut out = std::ptr::null_mut();
    let mut len = 0;
    let code = match op {
        1 => unsafe { ch_challenge(payload.as_ptr(), payload.len() as u32, &mut out, &mut len) },
        2 => unsafe { ch_update(payload.as_ptr(), payload.len() as u32) },
        4 => unsafe { ch_status(&mut out, &mut len) },
        3 => {
            ensure!(payload.len() >= 36, "Invalid sample request");
            let iv = &payload[..16];
            let kid = &payload[16..32];
            let count = u32::from_le_bytes(payload[32..36].try_into()?) as usize;
            let end = 36usize
                .checked_add(count.checked_mul(8).context("Invalid subsamples")?)
                .context("Invalid subsamples")?;
            ensure!(end <= payload.len(), "Truncated sample request");
            let subs: Vec<u32> = payload[36..end]
                .as_chunks::<4>()
                .0
                .iter()
                .map(|v| u32::from_le_bytes(*v))
                .collect();
            let data = &payload[end..];
            unsafe {
                ch_decrypt(
                    data.as_ptr(),
                    data.len() as u32,
                    kid.as_ptr(),
                    16,
                    iv.as_ptr(),
                    16,
                    subs.as_ptr(),
                    count as u32,
                    &mut out,
                    &mut len,
                )
            }
        }
        _ => bail!("Unknown CDM operation"),
    };
    if code == i32::from(MISSING_KEY) {
        return Err(MissingKey.into());
    }
    ensure!(code == 0, "CDM operation failed ({code})");
    let bytes = if len == 0 {
        Vec::new()
    } else {
        ensure!(
            !out.is_null() && len as usize <= LIMIT,
            "Invalid CDM response"
        );
        unsafe { std::slice::from_raw_parts(out, len as usize).to_vec() }
    };
    unsafe { ch_free(out) };
    Ok(bytes)
}

struct Pipes {
    to: BufWriter<ChildStdin>,
    from: BufReader<ChildStdout>,
}
pub struct Cdm {
    pipes: Mutex<Pipes>,
    child: Arc<Mutex<Child>>,
    deadline: Arc<Mutex<Option<Instant>>>,
    closed: Arc<AtomicBool>,
}

impl Cdm {
    pub fn open(path: &Path) -> Result<Self> {
        let mut command = Command::new(std::env::current_exe()?);
        command
            .arg(HOST_ARG)
            .arg(path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            command.creation_flags(0x0800_0000);
        }
        let mut child = command.spawn().context("Could not start Widevine host")?;
        let pipes = Pipes {
            to: BufWriter::new(child.stdin.take().context("CDM stdin missing")?),
            from: BufReader::new(child.stdout.take().context("CDM stdout missing")?),
        };
        let cdm = Self {
            pipes: Mutex::new(pipes),
            child: Arc::new(Mutex::new(child)),
            deadline: Arc::new(Mutex::new(Some(Instant::now() + TIMEOUT))),
            closed: Arc::new(AtomicBool::new(false)),
        };
        let (child, deadline, closed) =
            (cdm.child.clone(), cdm.deadline.clone(), cdm.closed.clone());
        std::thread::Builder::new()
            .name("widevine-watch".into())
            .spawn(move || {
                while !closed.load(Ordering::Acquire) {
                    if deadline
                        .lock()
                        .unwrap()
                        .is_some_and(|at| Instant::now() >= at)
                    {
                        let _ = child.lock().unwrap().kill();
                        break;
                    }
                    std::thread::sleep(Duration::from_millis(100));
                }
            })?;
        let (status, version) = read_frame(&mut cdm.pipes.lock().unwrap().from)
            .context("Widevine host could not initialise")?;
        ensure!(
            status == 0 && version == b"opfelmusig-cdm/1",
            "Invalid Widevine host handshake"
        );
        *cdm.deadline.lock().unwrap() = None;
        Ok(cdm)
    }

    fn call(&self, op: u8, payload: &[u8]) -> Result<Vec<u8>> {
        let mut pipes = self.pipes.lock().unwrap();
        *self.deadline.lock().unwrap() = Some(Instant::now() + TIMEOUT);
        let result = (|| {
            write_frame(&mut pipes.to, op, payload)?;
            let (status, bytes) = read_frame(&mut pipes.from)?;
            if status == MISSING_KEY {
                return Err(MissingKey.into());
            }
            ensure!(status == 0, "{}", String::from_utf8_lossy(&bytes));
            Ok(bytes)
        })();
        *self.deadline.lock().unwrap() = None;
        result
    }

    pub fn challenge(&self, init: &[u8]) -> Result<Vec<u8>> {
        self.call(1, init)
    }
    pub fn accept(&self, license: &[u8]) -> Result<()> {
        self.call(2, license).map(|_| ())
    }
    pub fn license_status(&self) -> Result<LicenseStatus> {
        let bytes = self.call(4, &[])?;
        let (&expired, renewal) = bytes.split_first().context("Invalid CDM licence status")?;
        Ok(LicenseStatus {
            expired: expired != 0,
            renewal: (!renewal.is_empty()).then(|| renewal.to_vec()),
        })
    }
    pub fn decrypt(
        &self,
        sample: &mut [u8],
        kid: &[u8; 16],
        iv: &[u8; 16],
        subs: &[(u32, u32)],
    ) -> Result<()> {
        let mut payload = Vec::with_capacity(36 + subs.len() * 8 + sample.len());
        payload.extend_from_slice(iv);
        payload.extend_from_slice(kid);
        payload.extend_from_slice(&(subs.len() as u32).to_le_bytes());
        for (clear, cipher) in subs {
            payload.extend_from_slice(&clear.to_le_bytes());
            payload.extend_from_slice(&cipher.to_le_bytes());
        }
        payload.extend_from_slice(sample);
        let bytes = self.call(3, &payload)?;
        ensure!(
            bytes.len() == sample.len(),
            "CDM returned the wrong sample size"
        );
        sample.copy_from_slice(&bytes);
        Ok(())
    }
}

impl Drop for Cdm {
    fn drop(&mut self) {
        self.closed.store(true, Ordering::Release);
        if let Ok(mut child) = self.child.lock() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}
