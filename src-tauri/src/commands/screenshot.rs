use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::path::PathBuf;
use tauri::command;
use tracing::{info, error};
use xcap::Monitor;
use chrono::Local;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScreenshotParams {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize)]
pub struct ScreenshotResult {
    pub success: bool,
    pub path: String,
    pub message: String,
}

#[command]
pub async fn take_screenshot(params: ScreenshotParams) -> Result<ScreenshotResult, String> {
    info!(
        "Taking screenshot at ({}, {}) with size {}x{}",
        params.x, params.y, params.width, params.height
    );

    // Get the screenshots directory in Pictures folder
    let pictures_dir = dirs::picture_dir()
        .ok_or_else(|| "Could not find Pictures directory".to_string())?;

    let screenshots_dir = pictures_dir.join("screenshots");

    // Create screenshots directory if it doesn't exist
    if let Err(e) = fs::create_dir_all(&screenshots_dir) {
        error!("Failed to create screenshots directory: {}", e);
        return Err(format!("Failed to create screenshots directory: {}", e));
    }

    // Generate filename with timestamp
    let timestamp = Local::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("screenshot_{}.png", timestamp);
    let file_path: PathBuf = screenshots_dir.join(&filename);

    // Capture the full screen
    let monitors = Monitor::all()
        .map_err(|e| format!("Failed to get monitors: {}", e))?;
    let monitor = monitors.first()
        .ok_or_else(|| "No monitor found".to_string())?;
    let full_image = monitor.capture_image()
        .map_err(|e| format!("Failed to capture screen: {}", e))?;

    // Get image dimensions
    let full_width = full_image.width() as i32;
    let full_height = full_image.height() as i32;

    // Validate bounds
    if params.x < 0 || params.y < 0 ||
       params.x + params.width as i32 > full_width ||
       params.y + params.height as i32 > full_height {
        return Err("Screenshot region is out of bounds".to_string());
    }

    // Create a new image for the cropped region using xcap's image type
    let mut cropped = xcap::image::ImageBuffer::new(params.width, params.height);

    // Copy pixels from the full image to the cropped image
    for py in 0..params.height {
        for px in 0..params.width {
            let src_x = params.x as u32 + px;
            let src_y = params.y as u32 + py;
            let pixel = full_image.get_pixel(src_x, src_y);
            cropped.put_pixel(px, py, *pixel);
        }
    }

    // Save the cropped screenshot
    let mut file = File::create(&file_path)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    if let Err(e) = cropped.write_to(&mut std::io::BufWriter::new(&mut file), xcap::image::ImageFormat::Png) {
        error!("Failed to save screenshot: {}", e);
        return Err(format!("Failed to save screenshot: {}", e));
    }

    info!("Screenshot saved to: {:?}", file_path);

    Ok(ScreenshotResult {
        success: true,
        path: file_path.to_string_lossy().to_string(),
        message: format!("Screenshot saved to {}", file_path.display()),
    })
}
