mod host;
mod install;

pub use host::{run_host, Cdm, MissingKey};
pub use install::ensure;

/// CENC init data naming a key, not the content key itself.
pub fn pssh(key_id: &[u8]) -> Vec<u8> {
    let mut payload = vec![0x08, 0x01, 0x12, 16];
    payload.extend_from_slice(key_id);
    payload.extend_from_slice(&[0x1a, 0, 0x32, 0]);
    let mut out = Vec::new();
    out.extend_from_slice(&((32 + payload.len()) as u32).to_be_bytes());
    out.extend_from_slice(b"pssh\0\0\0\0");
    out.extend_from_slice(&[
        0xed, 0xef, 0x8b, 0xa9, 0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21,
        0xed,
    ]);
    out.extend_from_slice(&(payload.len() as u32).to_be_bytes());
    out.extend_from_slice(&payload);
    out
}
