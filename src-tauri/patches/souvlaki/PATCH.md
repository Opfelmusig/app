This is Souvlaki 0.8.3 from crates.io, originally published from commit
`5d356270b07ca1b9ad287297688c1439a547aebc`.

The macOS metadata update keeps the previous artwork while the next cover is
loaded asynchronously. Base metadata is published before starting the load,
and failed image loads leave the previous artwork intact. Remove this patch
when the behavior is available in an upstream release.

The empty `cargo-clippy` feature registers a legacy cfg used by Souvlaki's
Objective-C dependency so current Rust versions do not warn for every macro call.
