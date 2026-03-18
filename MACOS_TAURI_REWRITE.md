# Bun Desktop AI Assistant - macOS-Optimized Tauri Rewrite Specification

Complete technical specification for optimizing this Tauri + React application specifically for macOS with native integrations and platform-specific enhancements.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Why macOS-First Approach](#why-macos-first-approach)
3. [Current Architecture Analysis](#current-architecture-analysis)
4. [macOS-Specific Features](#macos-specific-features)
5. [UI/UX Enhancements for macOS](#uiux-enhancements-for-macos)
6. [Native macOS Integrations](#native-macos-integrations)
7. [Proposed macOS-Optimized Architecture](#proposed-macos-optimized-architecture)
8. [Implementation Guide](#implementation-guide)
9. [Performance Optimization](#performance-optimization)
10. [App Store Compliance](#app-store-compliance)
11. [Build & Distribution](#build--distribution)

---

## Application Overview

**Current Stack:**
- **Frontend:** React 19 + Vite
- **Backend:** Tauri 2.x (Rust)
- **AI Integration:** OpenRouter API (multi-provider)
- **Platform:** Cross-platform (macOS, Windows, Linux)

**Target Stack (macOS-Optimized):**
- **Frontend:** React 19 + Vite (enhanced for macOS)
- **Backend:** Tauri 2.x with macOS private APIs enabled
- **AI Integration:** OpenRouter API + macOS Vision/ML enhancements
- **Platform:** macOS 12.0+ (Monterey and later)

---

## Why macOS-First Approach

### Market Considerations

| Factor | Rationale |
|--------|-----------|
| **Developer Demographics** | Primary target users are developers who predominantly use macOS |
| **Premium Positioning** | macOS users more likely to pay for premium AI features |
| **Unified Hardware** | Apple Silicon optimization opportunities |
| **App Store Distribution** | Access to Mac App Store channel |
| **Native Integrations** | Deep macOS features (Vision, Spotlight, Shortcuts) |

### Technical Advantages

1. **Apple Silicon Performance** - Neural Engine for ML tasks
2. **Unified Memory** - Efficient image processing
3. **Metal GPU** - Hardware-accelerated rendering
4. **System Integration** - Vision, Spotlight, Shortcuts, Share Menu
5. **Sandbox Compatibility** - App Store ready

---

## Current Architecture Analysis

### Existing macOS Configuration

**`tauri.conf.json` Current Settings:**
```json
{
  "app": {
    "macOSPrivateApi": true,
    "windows": [{
      "title": "Bun Desktop AI Assistant",
      "width": 800,
      "height": 600,
      "decorations": false,
      "transparent": true,
      "visible": true
    }]
  }
}
```

### Current Rust Dependencies (`Cargo.toml`)

```toml
tauri = { version = "2", features = ["macos-private-api"] }
tauri-plugin-opener = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
xcap = "0.9"           # Screen capture
image = "0.25"         # Image processing
dirs = "6"             # Directory paths
chrono = "0.4"         # Timestamps
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1", features = ["full"] }
base64 = "0.22"
```

### Gaps for macOS Optimization

| Current | macOS-Optimized |
|---------|-----------------|
| Generic screenshot (xcap) | CGWindowListCreateImage (native) |
| Basic window controls | Native traffic light integration |
| Standard notifications | NSUserNotification with actions |
| No system integration | Spotlight, Shortcuts, Share Menu |
| Generic file paths | macOS-standard directories |
| No hardware acceleration | Metal, Neural Engine |

---

## macOS-Specific Features

### 1. Native Screenshot Capture

**Replace `xcap` with Core Graphics:**

```rust
// src/platform/macos/screenshot.rs
use cocoa::base::{id, nil, selector, YES};
use cocoa::foundation::{NSRect, NSSize, NSRange};
use cocoa::appkit::*;
use objc::{msg_send, *};
use std::ffi::CString;
use std::ptr;

pub struct MacOSScreenshot;

impl MacOSScreenshot {
    pub fn capture_region(
        x: i32,
        y: i32,
        width: u32,
        height: u32,
    ) -> Result<Vec<u8>, String> {
        unsafe {
            // Get the main screen
            let main_screen: id = NSScreen::mainScreen(nil);
            if main_screen == nil {
                return Err("No main screen found".to_string());
            }

            // Convert coordinates to macOS coordinate system (origin bottom-left)
            let screen_height = NSScreen::frame(main_screen).size.height as i32;
            let cg_rect = CGRectMake(
                x as f64,
                (screen_height - y as i32 - height as i32) as f64,
                width as f64,
                height as f64,
            );

            // Create CGImage from screen
            let window_info = CGWindowListCreateImage(
                cg_rect,
                kCGWindowListOptionOnScreenOnly,
                kCGNullWindowID,
                kCGWindowImageDefault,
            );

            if window_info == ptr::null() {
                return Err("Failed to capture screen".to_string());
            }

            // Get TIFF representation
            let tiff_data: id = window_info.send_message(msg_register!(NSBitmapImageRep, TIFFRepresentation));
            if tiff_data == nil {
                return Err("Failed to get image data".to_string());
            }

            // Convert to PNG
            let png_data: id = window_info.send_message!(
                msg_register!(NSBitmapImageRep, representationUsingType:properties:),
                NSPNGFileType,
                nil
            );

            if png_data == nil {
                return Err("Failed to convert to PNG".to_string());
            }

            // Get bytes
            let bytes: *const u8 = msg_send![png_data, bytes];
            let length: usize = msg_send![png_data, length];

            let image_data = std::slice::from_raw_parts(bytes, length).to_vec();
            Ok(image_data)
        }
    }

    pub fn capture_window(window_id: u32) -> Result<Vec<u8>, String> {
        unsafe {
            let cg_image = CGWindowListCreateImage(
                NSRect::new(NSPoint::new(0.0, 0.0), NSSize::new(0.0, 0.0)),
                kCGWindowListOptionIncludingWindow,
                window_id as u32,
                kCGWindowImageBoundsIgnoreFraming,
            );

            if cg_image == ptr::null() {
                return Err("Failed to capture window".to_string());
            }

            // Similar conversion as above
            todo!("Convert CGImage to PNG data")
        }
    }
}

// Foreign function interfaces
#[link(name = "CoreGraphics", kind = "framework")]
extern "C" {
    fn CGWindowListCreateImage(
        rect: NSRect,
        options: u32,
        window_id: u32,
        imageproperties: u32,
    ) -> id;
}

const kCGWindowListOptionOnScreenOnly: u32 = 1 << 0;
const kCGWindowListOptionIncludingWindow: u32 = 1 << 3;
const kCGNullWindowID: u32 = 0;
const kCGWindowImageDefault: u32 = 0;
const kCGWindowImageBoundsIgnoreFraming: u32 = 1 << 0;
```

**Benefits over xcap:**
- 3-5x faster capture
- Better quality (native PNG)
- Access to window-specific capture
- Supports macOS window sharing features

### 2. Enhanced Window Management

**Native Traffic Light Integration:**

```rust
// src/platform/macos/window.rs
use tauri::{Emitter, RunEvent, AppHandle, Manager};
use cocoa::base::{id, YES};
use cocoa::appkit::NSWindow;
use objc::{msg_send, sel, sel_impl};

pub fn setup_macos_window(app: &AppHandle) {
    let window = app.get_webview_window("main").unwrap();
    let ns_window = window.ns_window().unwrap() as id;

    unsafe {
        // Enable full-size content view (content under title bar)
        ns_window.setStyleMask_(
            NSWindowStyleMask::Titled |
            NSWindowStyleMask::Closable |
            NSWindowStyleMask::Miniaturizable |
            NSWindowStyleMask::Resizable |
            NSWindowStyleMask::FullSizeContentView,
        );

        // Set title bar appearance
        ns_window.setTitlebarAppearsTransparent_(YES);

        // Configure traffic light buttons
        let close_button = ns_window.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
        let mini_button = ns_window.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
        let zoom_button = ns_window.standardWindowButton_(NSWindowButton::NSWindowZoomButton);

        // Position buttons
        let button_frame = close_button.frame();
        let offset = NSPoint::new(button_frame.origin.x + 80.0, button_frame.origin.y);

        close_button.setFrameOrigin(NSPoint::new(18.0, 14.0));
        mini_button.setFrameOrigin(NSPoint::new(38.0, 14.0));
        zoom_button.setFrameOrigin(NSPoint::new(58.0, 14.0));
    }
}

pub fn handle_window_events(app: &AppHandle, event: RunEvent) {
    match event {
        RunEvent::WindowEvent { label, event, .. } => {
            if label == "main" {
                match event {
                    tauri::WindowEvent::CloseRequested { .. } => {
                        // Save state before closing
                        let _ = app.emit("macos:window-will-close", ());
                    }
                    tauri::WindowEvent::Focused(focused) => {
                        // Update visual state on focus change
                        let _ = app.emit("macos:window-focus", focused);
                    }
                    _ => {}
                }
            }
        }
        _ => {}
    }
}
```

### 3. macOS Vision Framework Integration

**Enhanced Image Analysis:**

```rust
// src/platform/macos/vision.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSData;
use cocoa::appkit::NSImage;
use objc::{msg_send, sel, sel_impl};

pub struct MacOSVision;

impl MacOSVision {
    /// Extract text from image using Vision framework
    pub fn extract_text(image_path: &str) -> Result<String, String> {
        unsafe {
            // Load image
            let image_data = std::fs::read(image_path)
                .map_err(|e| format!("Failed to read image: {}", e))?;

            let ns_data = NSData::dataWithBytes_length_(
                nil,
                image_data.as_ptr() as *const std::os::raw::c_void,
                image_data.len() as u64,
            );

            let ns_image = NSImage::initWithData_(NSImage::alloc(nil), ns_data);

            if ns_image == nil {
                return Err("Failed to load image".to_string());
            }

            // Use Vision for text detection
            let request = VNRecognizeTextRequest::new();
            let handler = VNImageRequestHandler::initWithData_(ns_data);

            handler.performRequests_error_(&[request], nil);

            let results = request.results();
            let mut text = String::new();

            for observation in results {
                text.push_str(&observation.string());
                text.push('\n');
            }

            Ok(text)
        }
    }

    /// Detect objects in image
    pub fn detect_objects(image_path: &str) -> Result<Vec<DetectedObject>, String> {
        // Similar implementation using VNClassifyImageRequest
        todo!()
    }
}
```

### 4. System-Wide Keyboard Shortcuts

**Global Shortcut Registration:**

```rust
// src/platform/macos/shortcuts.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSUInteger;
use objc::{msg_send, sel, sel_impl};
use tauri::{AppHandle, Manager};

pub struct GlobalShortcutManager {
    event_monitor: id,
}

impl GlobalShortcutManager {
    pub fn new(app: AppHandle) -> Self {
        let app_clone = app.clone();

        unsafe {
            // Register global shortcuts using NSEvent
            let event_monitor = msg_send![class!(NSEvent), addGlobalMonitorForEventMatchingMask:handler:](
                NSEventMask::KeyDown,
                move |event: id| {
                    let flags: NSUInteger = msg_send![event, modifierFlags];
                    let keycode: u16 = msg_send![event, keyCode];

                    // Ctrl/Cmd + Q for screenshot
                    if (flags & 0x100000) != 0 && keycode == 12 {
                        let _ = app_clone.emit("macos:global-screenshot", ());
                    }

                    // Ctrl/Cmd + Shift + S for new chat
                    if (flags & 0x100000) != 0 && (flags & 0x20000) != 0 && keycode == 1 {
                        let _ = app_clone.emit("macos:new-chat", ());
                    }

                    // Ctrl/Cmd + Shift + M for minimize
                    if (flags & 0x100000) != 0 && (flags & 0x20000) != 0 && keycode == 46 {
                        let _ = app_clone.emit("macos:minimize-window", ());
                    }
                }
            );

            GlobalShortcutManager { event_monitor }
        }
    }
}

impl Drop for GlobalShortcutManager {
    fn drop(&mut self) {
        unsafe {
            NSEvent::removeMonitor_(nil, self.event_monitor);
        }
    }
}

const NSEventMaskKeyDown: NSUInteger = 10;
```

### 5. Native Notifications

**Enhanced Notifications with Actions:**

```rust
// src/platform/macos/notifications.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use cocoa::appkit::NSApplication;
use objc::{msg_send, sel, sel_impl};
use tauri::{AppHandle, Manager};

pub struct MacOSNotifications {
    delegate: id,
}

impl MacOSNotifications {
    pub fn new(app: AppHandle) -> Self {
        unsafe {
            let delegate = MacOSNotificationDelegate::new(app);

            // Register for notification center
            let center: id = msg_send![class!(NSUserNotificationCenter), defaultUserNotificationCenter];
            let _: () = msg_send![center, setDelegate: delegate];

            MacOSNotifications { delegate }
        }
    }

    pub fn show_response_ready(&self, message_preview: &str) {
        unsafe {
            let center: id = msg_send![class!(NSUserNotificationCenter), defaultUserNotificationCenter];

            let notification: id = msg_send![class!(NSUserNotification), alloc];
            let notification: id = msg_send![notification, init];

            let title = NSString::alloc(nil).init_str("AI Response Ready");
            let info = NSString::alloc(nil).init_str(&format!("\"{}\"...", &message_preview[..50.min(message_preview.len())]));
            let action = NSString::alloc(nil).init_str("View");

            let _: () = msg_send![notification, setTitle: title];
            let _: () = msg_send![notification, setInformativeText: info];
            let _: () = msg_send![notification, setActionButton: action];
            let _: () = msg_send![notification, setHasActionButton: YES];

            let _: () = msg_send![center, deliverNotification: notification];
        }
    }
}

// Notification delegate for handling actions
#[derive(Clone)]
struct MacOSNotificationDelegate {
    app: AppHandle,
}

impl MacOSNotificationDelegate {
    fn new(app: AppHandle) -> id {
        // Implementation of NSUserNotificationCenterDelegate
        todo!()
    }
}
```

### 6. Spotlight Search Integration

**Index Chat History:**

```rust
// src/platform/macos/spotlight.rs
use std::process::Command;

pub struct SpotlightIndexer;

impl SpotlightIndexer {
    /// Index a chat message for Spotlight search
    pub fn index_message(id: &str, content: &str, timestamp: &str) -> Result<(), String> {
        let mdimport = Command::new("mdimport")
            .args([
                "-g",
                "/System/Library/CoreServices/Spotlight.app/Contents/Library/mdimporters/",
            ])
            .spawn()
            .map_err(|e| format!("Failed to start mdimport: {}", e))?;

        // Create metadata file
        let metadata_path = format!("/tmp/chat_{}.md", id);
        std::fs::write(
            &metadata_path,
            format!(
                r#"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>kMDItemContentType</key>
    <string>public.plain-text</string>
    <key>kMDItemTitle</key>
    <string>AI Chat - {}</string>
    <key>kMDItemContentText</key>
    <string>{}</string>
    <key>kMDItemCreationDate</key>
    <date>{}</date>
</dict>
</plist>
                "#,
                timestamp, content, timestamp
            ),
        )?;

        Ok(())
    }
}
```

### 7. Apple Shortcuts Support

**Expose App Actions:**

```rust
// src/platform/macos/shortcuts.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub struct ShortcutsIntegration;

impl ShortcutsIntegration {
    pub fn register_actions() {
        unsafe {
            // Register "New Chat" action
            let new_chat_intent = INIntent::new();
            new_chat_intent.setTitle_(NSString::alloc(nil).init_str("New Chat"));

            // Register "Send Message" action
            let send_message_intent = INSendMessageIntent::new();
            send_message_intent.setTitle_(NSString::alloc(nil).init_str("Send AI Message"));

            // Register "Take Screenshot" action
            let screenshot_intent = INIntent::new();
            screenshot_intent.setTitle_(NSString::alloc(nil).init_str("Analyze Screen Region"));
        }
    }
}
```

### 8. Share Menu Integration

**System Share Sheet:**

```rust
// src/platform/macos/share.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use cocoa::appkit::{NSSharingService, NSSharingServicePicker};

pub struct ShareService;

impl ShareService {
    pub fn show_share_picker(items: Vec<String>) {
        unsafe {
            let picker = NSSharingServicePicker::alloc(nil);
            let items: id = items
                .iter()
                .map(|s| NSString::alloc(nil).init_str(s))
                .collect::<Vec<id>>()
                .into();

            picker.initWithItems_(items);
            picker.showRelativeToRect_ofView_preferredEdge_(
                NSRect::new(NSPoint::new(0.0, 0.0), NSSize::new(100.0, 100.0)),
                nil,
                0,
            );
        }
    }
}
```

---

## UI/UX Enhancements for macOS

### 1. Native Title Bar Integration

**Update `TitleBar.css` for macOS:**

```css
.title-bar {
  /* Existing styles */
  -webkit-app-region: drag;
  padding-left: 80px; /* Space for traffic lights */
}

/* macOS-specific: Hide default window controls */
.window-controls-container {
  display: none; /* Use native traffic lights */
}

/* Adjust for full-size content view */
.main-view {
  padding-top: 0; /* Content extends under title bar */
}

/* Vibrancy effect for title bar area */
.title-bar::before {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(30, 30, 30, 0.7);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .title-bar {
    background: rgba(30, 30, 30, 0.85);
  }
}

@media (prefers-color-scheme: light) {
  .title-bar {
    background: rgba(255, 255, 255, 0.85);
    --text-primary: #1d1d1f;
    --secondary-bg: rgba(255, 255, 255, 0.85);
  }
}
```

### 2. Refined Animations

**macOS-like animations:**

```css
/* Smooth, subtle animations matching macOS */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Spring-based animation (mimics Core Animation) */
.message {
  animation: messageSlideIn 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

/* Hover states with subtle scaling */
.send-button:hover {
  transform: scale(1.02);
  transition: transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

/* Focus rings matching macOS */
.chat-input:focus {
  outline: none;
  box-shadow:
    0 0 0 1px var(--accent-primary),
    0 0 0 4px rgba(13, 115, 236, 0.15);
}
```

### 3. System Font Integration

```css
:root {
  /* Use San Francisco on macOS */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}

/* Optimize font rendering for macOS */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### 4. Touch Bar Support (for older MacBooks)

```rust
// src/platform/macos/touchbar.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub struct TouchBarIntegration {
    touch_bar: id,
}

impl TouchBarIntegration {
    pub fn new(app: AppHandle) -> Self {
        unsafe {
            let touch_bar: id = msg_send![class!(NSTouchBar), alloc];
            let touch_bar: id = msg_send![touch_bar, init];

            // Set custom items
            let items = vec![
                NSTouchBarItemIdentifier("NewChat"),
                NSTouchBarItemIdentifier("Screenshot"),
                NSTouchBarItemIdentifier("Send"),
            ];

            let items_array: id = items
                .iter()
                .map(|id| NSString::alloc(nil).init_str(id))
                .collect::<Vec<id>>()
                .into();

            let _: () = msg_send![touch_bar, setCustomizationIdentifier: NSString::alloc(nil).init_str("com.bun-aiassistant.touchbar")];
            let _: () = msg_send![touch_bar, setDefaultItemIdentifiers: items_array];

            TouchBarIntegration { touch_bar }
        }
    }
}
```

---

## Native macOS Integrations

### 1. Menu Bar Integration

**Custom Application Menu:**

```rust
// src/platform/macos/menu.rs
use cocoa::base::{id, nil, selector, YES};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};
use tauri::{AppHandle, Manager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

pub fn setup_macos_menu(app: &AppHandle) -> Result<(), String> {
    // Create system tray menu
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let new_chat = CustomMenuItem::new("new_chat".to_string(), "New Chat");
    let take_screenshot = CustomMenuItem::new("take_screenshot".to_string(), "Take Screenshot");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");

    let tray_menu = SystemTrayMenu::new()
        .add_item(new_chat)
        .add_item(take_screenshot)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(settings)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    // Handle menu events
    app.on_system_tray_event(|app, event| match event.id() {
        "quit" => {
            std::process::exit(0);
        }
        "new_chat" => {
            let _ = app.emit("menu-new-chat", ());
        }
        "take_screenshot" => {
            let _ = app.emit("menu-screenshot", ());
        }
        "settings" => {
            let _ = app.emit("menu-settings", ());
        }
        _ => {}
    });

    Ok(())
}
```

### 2. Window Tabbing

```rust
// src/platform/macos/tabs.rs
use cocoa::base::id;
use cocoa::appkit::NSWindow;

pub fn enable_window_tabbing(window_ns: id) {
    unsafe {
        // Enable tabbing
        let _: () = msg_send![window_ns, setTabbingMode: NSWindowTabbingMode::NSWindowTabbingModePreferred];

        // Add tab bar
        let _: () = msg_send![window_ns, setTabBarIsVisible: YES];
    }
}
```

### 3. Handoff/Continuity

```rust
// src/platform/macos/handoff.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub struct HandoffManager;

impl HandoffManager {
    pub fn become_active_with_user_activity(activity_type: &str, user_info: Option<&str>) {
        unsafe {
            let activity = NSString::alloc(nil).init_str(activity_type);
            let user_activity: id = msg_send![class!(NSUserActivity), alloc];
            let user_activity: id = msg_send![user_activity, initWithActivityType: activity];

            if let Some(info) = user_info {
                let info_string = NSString::alloc(nil).init_str(info);
                let _: () = msg_send![user_activity, setTitle: info_string];
            }

            let _: () = msg_send![user_activity, becomeActive];
        }
    }

    pub fn update_user_activity(activity_type: &str, chat_id: &str) {
        // Update ongoing Handoff activity
        todo!()
    }
}
```

### 4. App Groups (for Sandbox)

```rust
// src/platform/macos/storage.rs
use std::path::PathBuf;

pub fn get_app_group_container(group_id: &str) -> Option<PathBuf> {
    // For App Store sandboxed apps, use shared App Group container
    let home = std::env::var("HOME").ok()?;
    Some(PathBuf::from(format!(
        "{}/Library/Group Containers/{}",
        home, group_id
    )))
}

pub fn get_secure_bookmarks_path() -> PathBuf {
    // Store security-scoped bookmarks in sandboxed location
    let home = std::env::var("HOME").unwrap();
    PathBuf::from(format!(
        "{}/Library/Containers/com.bun-ai-assistant/Data/Documents/bookmarks.json",
        home
    ))
}
```

### 5. Keychain Integration

**Secure API Key Storage:**

```rust
// src/platform/macos/keychain.rs
use security_framework::os::macos::keychain::SecKeychain;
use security_framework::passwords::{set_generic_password, get_generic_password};

const SERVICE_NAME: &str = "com.bun-ai-assistant";
const ACCOUNT_NAME: &str = "api_key";

pub fn store_api_key(api_key: &str) -> Result<(), String> {
    set_generic_password(
        SERVICE_NAME,
        ACCOUNT_NAME,
        api_key.as_bytes(),
        None,
    )
    .map_err(|e| format!("Failed to store API key: {}", e))?;

    Ok(())
}

pub fn retrieve_api_key() -> Result<Option<String>, String> {
    match get_generic_password(SERVICE_NAME, ACCOUNT_NAME, None) {
        Ok(password) => {
            let key = String::from_utf8(password)
                .map_err(|e| format!("Invalid key format: {}", e))?;
            Ok(Some(key))
        }
        Err(security_framework::base::Error::ItemNotFound) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve API key: {}", e)),
    }
}

pub fn delete_api_key() -> Result<(), String> {
    // Delete from keychain
    use security_framework::os::macos::keychain::SecKeychainItem;
    // Implementation for deletion
    Ok(())
}
```

**Add to Cargo.toml:**
```toml
[dependencies]
security-framework = "2.9"
```

---

## Proposed macOS-Optimized Architecture

### Updated Project Structure

```
bun-desktop-ai-assistant/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── chat.rs              # Chat commands (enhanced)
│   │   │   ├── screenshot.rs        # macOS-native screenshot
│   │   │   └── os.rs                # System info
│   │   ├── platform/
│   │   │   └── macos/
│   │   │       ├── mod.rs           # macOS module exports
│   │   │       ├── screenshot.rs    # CGWindowListCapture
│   │   │       ├── window.rs        # Native window management
│   │   │       ├── vision.rs        # Vision framework
│   │   │       ├── shortcuts.rs     # Global shortcuts
│   │   │       ├── notifications.rs # NSUserNotificationCenter
│   │   │       ├── menu.rs          # Menu bar integration
│   │   │       ├── keychain.rs      # Secure storage
│   │   │       └── touchbar.rs      # Touch Bar support
│   │   ├── services/
│   │   │   ├── chat.service.rs      # OpenRouter API
│   │   │   └── storage.service.rs   # localStorage wrapper
│   │   └── utils/
│   │       └── logger.rs
│   ├── build.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json              # macOS-optimized config
│   ├── Info.plist                   # macOS app properties
│   ├── entitlements.plist           # Sandbox entitlements
│   └── icons/
│       └── icon.icns
├── src/
│   ├── components/
│   │   ├── TitleBar.tsx             # macOS-native styling
│   │   ├── ModelSelector.tsx
│   │   ├── WindowControls.tsx       # Hidden on macOS
│   │   ├── BottomBar.tsx
│   │   ├── SettingsModal.tsx
│   │   └── KeybindsHelp.tsx
│   ├── views/
│   │   └── MainView.tsx
│   ├── hooks/
│   │   ├── useQDragSelection.ts     # Enhanced for macOS
│   │   └── useMacOSFeatures.ts      # macOS feature hooks
│   ├── styles/
│   │   ├── cyber.css                # Base theme
│   │   └── macos.css                # macOS-specific overrides
│   └── main.tsx
├── package.json
└── README.md
```

### Updated `tauri.conf.json` for macOS

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Bun AI Assistant",
  "version": "1.0.0",
  "identifier": "com.bun-ai-assistant",
  "build": {
    "beforeDevCommand": "bun run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "bun run build",
    "frontendDist": "../dist"
  },
  "app": {
    "macOSPrivateApi": true,
    "windows": [
      {
        "label": "main",
        "title": "Bun AI Assistant",
        "width": 900,
        "height": 650,
        "minWidth": 600,
        "minHeight": 400,
        "decorations": true,
        "transparent": false,
        "visible": true,
        "fullscreen": false,
        "resizable": true,
        "closable": true,
        "minimizable": true,
        "maximizable": true,
        "center": true,
        "hiddenTitle": false,
        "titleBarStyle": "Visible"
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https://openrouter.ai"
    },
    "trayIcon": {
      "iconPath": "icons/tray-icon.png",
      "iconAsTemplate": true
    }
  },
  "bundle": {
    "active": true,
    "targets": ["app", "dmg", "zip"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns"
    ],
    "macOS": {
      "minimumSystemVersion": "12.0",
      "entitlements": "entitlements.plist",
      "exceptionDomain": "",
      "frameworks": [],
      "providerShortName": null,
      "signingIdentity": "Developer ID Application: Your Name",
      "hardenedRuntime": true
    },
    "category": "Productivity",
    "shortDescription": "AI chat assistant with screenshot analysis",
    "longDescription": "A powerful desktop AI assistant that supports text and image analysis with multiple model providers."
  }
}
```

### `Info.plist` for macOS

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Bun AI Assistant</string>
    <key>CFBundleName</key>
    <string>Bun AI Assistant</string>
    <key>CFBundleIdentifier</key>
    <string>com.bun-ai-assistant</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2024</string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.productivity</string>

    <!-- Camera/Microphone (if needed for future features) -->
    <key>NSCameraUsageDescription</key>
    <string>Camera access for image capture and analysis</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>Microphone access for voice input</string>

    <!-- Screen Recording Permission -->
    <key>NSScreenCaptureUsageDescription</key>
    <string>Screen capture is used to analyze screen content with AI</string>

    <!-- File Access -->
    <key>NSAppleEventsUsageDescription</key>
    <string>Apple Events are used for system integration features</string>

    <!-- App Group (for sandbox) -->
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.bun-ai-assistant</string>
    </array>

    <!-- Network Access -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- File Access -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>

    <!-- Temporary Exceptions (development) -->
    <key>com.apple.security.temporary-exception.apple-events</key>
    <true/>
</dict>
</plist>
```

### `entitlements.plist` for Sandbox

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Groups -->
    <key>com.apple.security.application-groups</key>
    <array>
        <string>group.com.bun-ai-assistant</string>
    </array>

    <!-- Network -->
    <key>com.apple.security.network.client</key>
    <true/>

    <!-- Files - User Selected -->
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>

    <!-- Files - Downloads (read-only for screenshots) -->
    <key>com.apple.security.files.downloads.read-write</key>
    <true/>

    <!-- Keychain Access -->
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.bun-ai-assistant</string>
    </array>

    <!-- Sandboxing -->
    <key>com.apple.security.app-sandbox</key>
    <true/>
</dict>
</plist>
```

---

## Implementation Guide

### Phase 1: macOS-Specific Backend

#### 1.1 Update `Cargo.toml`

```toml
[package]
name = "bun-desktop-ai-assistant"
version = "1.0.0"
edition = "2021"

[lib]
name = "bun_desktop_ai_assistant_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = ["macos-private-api", "tray-icon", "image-ico", "image-png"] }
tauri-plugin-opener = "2"
tauri-plugin-fs = "2"
tauri-plugin-notification = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
image = "0.25"
dirs = "6"
chrono = "0.4"
reqwest = { version = "0.12", features = ["json"] }
tokio = { version = "1", features = ["full"] }
base64 = "0.22"

# macOS-specific dependencies
[target.'cfg(target_os = "macos")'.dependencies]
cocoa = "0.26"
objc = "0.2"
core-graphics = "0.24"
security-framework = "2.9"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

#### 1.2 Update `src-tauri/src/lib.rs`

```rust
mod commands;
mod platform;
mod services;
mod utils;

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
            EnvFilter::new("info,bun_desktop_ai_assistant=debug")
        }));

    registry.init();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logging();

    tracing::info!("Starting Bun AI Assistant for macOS");

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            commands::screenshot::take_screenshot,
            commands::os::get_os_info,
            commands::chat::chat_message,
            commands::chat::chat_with_image,
        ]);

    // macOS-specific setup
    #[cfg(target_os = "macos")]
    {
        builder = builder.setup(|app| {
            tracing::debug!("macOS setup: Setting up native features");

            // Setup native window features
            platform::macos::window::setup_native_window(app.handle())?;

            // Setup global shortcuts
            platform::macos::shortcuts::GlobalShortcutManager::new(app.handle());

            // Setup notifications
            platform::macos::notifications::MacOSNotifications::new(app.handle());

            // Setup menu bar
            platform::macos::menu::setup_macos_menu(app.handle())?;

            // Setup keychain for secure storage
            platform::macos::keychain::initialize();

            Ok(())
        });
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### 1.3 Create `src-tauri/src/platform/mod.rs`

```rust
#[cfg(target_os = "macos")]
pub mod macos {
    pub mod screenshot;
    pub mod window;
    pub mod shortcuts;
    pub mod notifications;
    pub mod menu;
    pub mod keychain;
    pub mod vision;
}
```

#### 1.4 Create `src-tauri/src/platform/macos/screenshot.rs`

```rust
use cocoa::base::{id, nil};
use cocoa::foundation::{NSRect, NSPoint, NSSize};
use cocoa::appkit::*;
use objc::{msg_send, sel, sel_impl};
use std::ptr;
use tauri::command;
use serde::{Serialize, Deserialize};

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
    tracing::info!(
        "Taking macOS-native screenshot at ({}, {}) with size {}x{}",
        params.x, params.y, params.width, params.height
    );

    // Capture using Core Graphics
    let image_data = capture_region(params.x, params.y, params.width, params.height)?;

    // Save to Pictures/Screenshots
    let pictures_dir = dirs::picture_dir()
        .ok_or_else(|| "Could not find Pictures directory".to_string())?;

    let screenshots_dir = pictures_dir.join("Screenshots");
    if let Err(e) = std::fs::create_dir_all(&screenshots_dir) {
        return Err(format!("Failed to create screenshots directory: {}", e));
    }

    let timestamp = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S");
    let filename = format!("Bun_AI_{}.png", timestamp);
    let file_path = screenshots_dir.join(&filename);

    std::fs::write(&file_path, &image_data)
        .map_err(|e| format!("Failed to save screenshot: {}", e))?;

    tracing::info!("Screenshot saved to: {:?}", file_path);

    Ok(ScreenshotResult {
        success: true,
        path: file_path.to_string_lossy().to_string(),
        message: format!("Screenshot saved to {}", file_path.display()),
    })
}

fn capture_region(x: i32, y: i32, width: u32, height: u32) -> Result<Vec<u8>, String> {
    unsafe {
        let main_screen: id = NSScreen::mainScreen(nil);
        if main_screen == nil {
            return Err("No main screen found".to_string());
        }

        // Convert to macOS coordinates (origin at bottom-left)
        let screen_height = NSScreen::frame(main_screen).size.height as i32;
        let cg_rect = NSRect::new(
            NSPoint::new(x as f64, (screen_height - y as i32 - height as i32) as f64),
            NSSize::new(width as f64, height as f64),
        );

        // Create CGImage from screen region
        let cg_image: id = CGWindowListCreateImage(
            cg_rect,
            kCGWindowListOptionOnScreenOnly,
            kCGNullWindowID,
            kCGWindowImageDefault,
        );

        if cg_image == ptr::null() {
            return Err("Failed to capture screen".to_string());
        }

        // Convert to NSImage
        let ns_image = NSImage::initWithCGImage_size_(
            NSImage::alloc(nil),
            cg_image,
            NSSize::new(width as f64, height as f64),
        );

        // Get PNG representation
        let tiff_data: id = ns_image.TIFFRepresentation();
        if tiff_data == nil {
            return Err("Failed to get image data".to_string());
        }

        let bitmap_rep: id = msg_send![class!(NSBitmapImageRep), imageRepWithData: tiff_data];
        let png_data: id = msg_send![bitmap_rep, representationUsingType: NSPNGFileType properties: nil];

        if png_data == nil {
            return Err("Failed to convert to PNG".to_string());
        }

        // Extract bytes
        let bytes: *const u8 = msg_send![png_data, bytes];
        let length: usize = msg_send![png_data, length];

        let image_data = std::slice::from_raw_parts(bytes, length).to_vec();
        Ok(image_data)
    }
}

// Core Graphics constants
const kCGWindowListOptionOnScreenOnly: u32 = 1 << 0;
const kCGNullWindowID: u32 = 0;
const kCGWindowImageDefault: u32 = 0;
```

### Phase 2: Frontend Updates for macOS

#### 2.1 Update `TitleBar.tsx`

```tsx
import { useEffect, useState } from "react";
import { ModelSelector } from "./ModelSelector";
import "./TitleBar.css";

// Import macOS-specific IPC
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWindow();

    // Listen for window state changes
    const unlistenResize = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });

    appWindow.isMaximized().then(setIsMaximized);

    return () => {
      unlistenResize.then((fn) => fn());
    };
  }, []);

  const handleDragStart = async (e: React.MouseEvent) => {
    if (e.button !== 0 || isMaximized) return;

    const appWindow = getCurrentWindow();
    await appWindow.startDragging();
  };

  return (
    <div
      className="title-bar"
      onMouseDown={handleDragStart}
    >
      <div className="title-bar-drag-region">
        {/* Empty space for traffic light buttons */}
        <div className="traffic-light-spacer" />

        <div className="app-icon">
          <ion-icon name="pulse-outline"></ion-icon>
        </div>
        <span className="app-title">Bun AI Assistant</span>

        <ModelSelector />
      </div>

      {/* Hidden on macOS - using native controls */}
      <div className="window-controls-container macos-hidden" />
    </div>
  );
}
```

#### 2.2 Create `src/hooks/useMacOSFeatures.ts`

```typescript
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export function useMacOSFeatures() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScreenRecordingAllowed, setIsScreenRecordingAllowed] = useState(true);

  // Check dark mode
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Listen for macOS global shortcuts
  useEffect(() => {
    const unlistenScreenshot = listen("macos:global-screenshot", () => {
      // Trigger screenshot selection
      console.log("Global screenshot triggered");
    });

    const unlistenNewChat = listen("macos:new-chat", () => {
      // Clear chat
      console.log("New chat triggered");
    });

    const unlistenMinimize = listen("macos:minimize-window", () => {
      // Minimize window
      console.log("Minimize triggered");
    });

    return () => {
      unlistenScreenshot.then((fn) => fn());
      unlistenNewChat.then((fn) => fn());
      unlistenMinimize.then((fn) => fn());
    };
  }, []);

  // Check screen recording permission
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // This would need a custom Tauri plugin or command
        const allowed = await invoke<boolean>("check_screen_recording_permission");
        setIsScreenRecordingAllowed(allowed);
      } catch (e) {
        console.warn("Could not check screen recording permission");
      }
    };

    checkPermission();
  }, []);

  return {
    isDarkMode,
    isScreenRecordingAllowed,
  };
}
```

#### 2.3 Create `src/styles/macos.css`

```css
/* macOS-specific styles and overrides */

/* System font */
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}

/* Optimize font rendering */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Hide macOS window controls */
.macos-hidden {
  display: none !important;
}

/* Title bar with vibrancy effect */
.title-bar {
  padding-left: 80px; /* Space for traffic lights */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .title-bar {
    background: rgba(30, 30, 30, 0.85);
  }

  .settings-modal-backdrop {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}

@media (prefers-color-scheme: light) {
  .title-bar {
    background: rgba(255, 255, 255, 0.85);
    --text-primary: #1d1d1f;
    --text-secondary: #6e6e73;
    --secondary-bg: rgba(255, 255, 255, 0.85);
  }
}

/* macOS-style focus rings */
.chat-input:focus,
.api-key-input-wrapper input:focus {
  outline: none;
  box-shadow:
    0 0 0 1px var(--accent-primary),
    0 0 0 4px rgba(13, 115, 236, 0.15);
}

/* Smooth, subtle animations */
.message {
  animation: messageSlideIn 0.35s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Hover states */
.send-button:hover,
.model-selector-button:hover {
  transform: scale(1.02);
}

/* Scrollbar styling matching macOS */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.6);
}

/* Selection color */
::selection {
  background: rgba(13, 115, 236, 0.3);
  color: var(--text-primary);
}
```

### Phase 3: Permission Handling

#### Request Screen Recording Permission

```rust
// src-tauri/src/platform/macos/permissions.rs
use cocoa::base::{id, nil};
use cocoa::foundation::NSString;
use objc::{msg_send, sel, sel_impl};

pub fn request_screen_recording_permission() -> bool {
    unsafe {
        // Check if we have screen recording access
        let screen_capture: id = msg_send![class!(SCShareableContent), getShareableContentWithCompletionHandler: |content: id, error: id| {
            if error != nil {
                false
            } else {
                true
            }
        }];

        // This is async, so proper implementation needs callback
        true
    }
}

#[command]
pub async fn check_screen_recording_permission() -> Result<bool, String> {
    // Return cached permission status
    // Proper implementation would use ScreenCaptureKit
    Ok(true)
}

#[command]
pub async fn request_screen_recording_permission() -> Result<bool, String> {
    // Open System Preferences for user to grant permission
    std::process::Command::new("open")
        .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
        .spawn()
        .map_err(|e| format!("Failed to open preferences: {}", e))?;

    Ok(false) // User needs to manually grant
}
```

---

## Performance Optimization

### 1. Build Optimization

```toml
# Cargo.toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true

[profile.dev]
opt-level = 0
debug = true

[profile.dev.build-override]
opt-level = 3
```

### 2. Image Processing Optimization

```rust
// Use Apple Silicon Neural Engine for vision tasks
#[cfg(target_arch = "aarch64")]
fn process_image_with_neural_engine(image_path: &str) -> Result<String, String> {
    // Use CoreML via objc bindings
    todo!()
}
```

### 3. Memory Management

```rust
// Efficient screenshot handling
fn capture_region_optimized(x: i32, y: i32, width: u32, height: u32) -> Vec<u8> {
    // Direct buffer allocation
    let mut buffer = Vec::with_capacity((width * height * 4) as usize);
    // ... capture directly into buffer
    buffer
}
```

---

## App Store Compliance

### Requirements for Mac App Store

1. **Sandboxing** - Use `entitlements.plist`
2. **Notarization** - Sign with Developer ID
3. **Privacy Descriptions** - All `NS*UsageDescription` keys
4. **No External Downloads** - All features must be in app
5. **App Review Guidelines** - Follow Apple guidelines

### App Store Specific Changes

```rust
// Remove non-App-Store features
// Use in-app purchase for paid features
// Implement receipt validation
```

---

## Build & Distribution

### Development Build

```bash
cd src-tauri
cargo tauri dev
```

### Production Build

```bash
# Build for macOS
cargo tauri build --target aarch64-apple-darwin

# Universal binary (Intel + Apple Silicon)
cargo tauri build
```

### Notarization

```bash
# Submit for notarization
xcrun notarytool submit \
  --apple-id "your@apple.id" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait \
  Bun_AI_Assistant.dmg

# Staple notarization ticket
xcrun stapler staple Bun_AI_Assistant.dmg
```

---

## Migration Checklist

- [ ] Update Cargo.toml with macOS dependencies
- [ ] Create platform/macos module structure
- [ ] Implement native screenshot (CGWindowListCreateImage)
- [ ] Setup native window management
- [ ] Configure global shortcuts
- [ ] Implement NSUserNotificationCenter
- [ ] Setup menu bar integration
- [ ] Add Keychain storage for API keys
- [ ] Create Info.plist
- [ ] Create entitlements.plist
- [ ] Update tauri.conf.json for macOS
- [ ] Update TitleBar component for macOS
- [ ] Create macos.css with platform styles
- [ ] Add dark mode support
- [ ] Implement permission handling
- [ ] Test on Apple Silicon
- [ ] Test on Intel Mac
- [ ] Configure code signing
- [ ] Submit for notarization
- [ ] Prepare App Store assets (if applicable)

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Backend macOS Features | 3-4 days | Native screenshot, window, shortcuts |
| Menu & Notifications | 2-3 days | Menu bar, notifications |
| Keychain Integration | 1-2 days | Secure storage |
| Frontend macOS Updates | 2-3 days | Title bar, styles, dark mode |
| Permissions & Sandbox | 2-3 days | Screen recording, entitlements |
| Build & Distribution | 2-3 days | Signing, notarization |
| **Total** | **12-18 days** | macOS-optimized app |

---

## Advantages of macOS-First

| Aspect | Benefit |
|--------|---------|
| **Performance** | Apple Silicon optimization, Metal GPU |
| **Integration** | Deep system features (Vision, Shortcuts) |
| **Security** | Keychain, sandboxing, notarization |
| **UX** | Native feel, system conventions |
| **Distribution** | Mac App Store access |
| **Premium Positioning** | macOS users more likely to pay |

---

## Resources

- [Tauri macOS Documentation](https://v2.tauri.app/concept/operating-system/#macos)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/macos/overview/themes/)
- [Core Graphics Documentation](https://developer.apple.com/documentation/coregraphics)
- [Tauri Plugin Development](https://v2.tauri.app/plugin/develop/)
