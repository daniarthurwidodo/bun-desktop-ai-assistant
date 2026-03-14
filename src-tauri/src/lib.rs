mod commands;

use tracing_subscriber::prelude::*;
use tracing_subscriber::{fmt, EnvFilter};

fn init_logging() {
    let registry = tracing_subscriber::registry()
        .with(
            fmt::layer()
                .with_target(true)
                .with_thread_ids(true)
                .with_file(true)
                .with_line_number(true),
        )
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| {
            EnvFilter::new("info,tauri=debug,bun_desktop_ai_assistant=debug")
        }));

    registry.init();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logging();

    tracing::info!("Starting Bun Desktop AI Assistant");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::screenshot::take_screenshot,
            commands::os::get_os_info,
            commands::chat::chat_message,
            commands::chat::chat_with_image,
        ])
        .setup(|app| {
            tracing::debug!("Setting up app: {}", app.package_info().name);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
