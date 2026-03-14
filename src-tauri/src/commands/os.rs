use serde::Serialize;
use tauri::command;
use tracing::info;

#[derive(Debug, Serialize)]
pub struct OsInfo {
    pub os_type: String,
    pub arch: String,
}

#[command]
pub fn get_os_info() -> Result<OsInfo, String> {
    let os_type = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    info!("OS: {}, Arch: {}", os_type, arch);

    Ok(OsInfo { os_type, arch })
}
