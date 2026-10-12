fn main() {
    for file in [
        "src/drm/shim/shim.cc",
        "src/drm/shim/cdm/content_decryption_module.h",
        "src/drm/shim/cdm/content_decryption_module_export.h",
    ] {
        println!("cargo:rerun-if-changed={file}");
    }
    cc::Build::new()
        .cpp(true)
        .std("c++14")
        .file("src/drm/shim/shim.cc")
        .include("src/drm/shim/cdm")
        .flag_if_supported("-Wno-unused-parameter")
        .flag_if_supported("/EHsc")
        .compile("cdmshim");
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("linux") {
        println!("cargo:rustc-link-lib=dl");
    }
    tauri_build::build()
}
