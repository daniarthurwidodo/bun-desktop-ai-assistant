# Bun Desktop AI Assistant - Flutter Rewrite Specification

Complete technical specification for rewriting this Tauri + React application in Flutter for cross-platform desktop.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Current Architecture](#current-architecture)
3. [Features & Functionality](#features--functionality)
4. [UI Components Breakdown](#ui-components-breakdown)
5. [Backend/API Integration](#backendapi-integration)
6. [State Management](#state-management)
7. [Proposed Flutter Architecture](#proposed-flutter-architecture)
8. [Package Recommendations](#package-recommendations)
9. [Implementation Guide](#implementation-guide)

---

## Application Overview

**Current Stack:**
- **Frontend:** React 19 + Vite
- **Backend:** Tauri 2.x (Rust)
- **AI Integration:** OpenRouter API (multi-provider)
- **Platform:** Desktop (macOS, Windows, Linux)

**App Purpose:** A desktop AI chat assistant that supports:
- Text-based conversations with multiple AI models
- Image analysis (vision models)
- Region screenshot capture for quick image analysis
- Model selection from 12+ providers (OpenAI, Anthropic, Google, Meta, Mistral)

---

## Current Architecture

### Layer Diagram (Current)

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ TitleBar │ │ MainView │ │BottomBar │ │Settings│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ModelSelect│ │Keybinds │ │DragSelection (Q key) │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         │ invoke()
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Tauri Backend (Rust)               │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ chat_message │ │chat_with_img│ │take_screenshot││
│  └──────────────┘ └──────────────┘ └─────────────┘ │
│  ┌──────────────┐ ┌──────────────┐                 │
│  │ get_os_info  │ │Window Control│                 │
│  └──────────────┘ └──────────────┘                 │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP
                         ▼
            ┌────────────────────────┐
            │   OpenRouter API       │
            │   (AI Model Gateway)   │
            └────────────────────────┘
```

### Key Technical Details

**Window Configuration (`tauri.conf.json`):**
- Frameless window (`decorations: false`)
- Transparent background (`transparent: true`)
- Custom title bar with drag region
- Default size: 800x600

**Rust Dependencies (`Cargo.toml`):**
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

**React Dependencies (`package.json`):**
```json
{
  "@tauri-apps/api": "^2",
  "@tauri-apps/plugin-opener": "^2",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "ionicons": "^8.0.13",
  "intro.js": "^8.3.2",
  "framer-motion": "^12.35.2"
}
```

---

## Features & Functionality

### 1. Chat Interface

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Text Chat | Send/receive AI messages | `MainView.jsx:83-115` |
| Image Analysis | Upload screenshots for AI analysis | `MainView.jsx:41-77` |
| Message History | Scrollable chat with avatars | `MainView.jsx:121-155` |
| Typing Indicator | Animated 3-dot loading state | `MainView.jsx:141-154` |
| Error Handling | Display API errors in chat | `MainView.jsx:109-112` |

### 2. Model Selection

| Model | Provider | Capabilities | Pricing Tier |
|-------|----------|--------------|--------------|
| GPT-3.5-turbo | OpenAI | Text | Free |
| GPT-4-turbo | OpenAI | Text, Image | Paid |
| GPT-4o | OpenAI | Text, Image | Paid |
| GPT-4o-mini | OpenAI | Text, Image | Free |
| Claude 3 Haiku | Anthropic | Text, Image | Free |
| Claude 3 Sonnet | Anthropic | Text, Image | Paid |
| Claude 3 Opus | Anthropic | Text, Image | Paid |
| Gemini Pro 1.5 | Google | Text, Image | Free |
| Llama 3 8B | Meta | Text | Free |
| Llama 3 70B | Meta | Text | Free |
| Mistral Small | Mistral | Text | Free |
| Mistral Large | Mistral | Text | Paid |

**Implementation:** `ModelSelector.jsx` - Dropdown with visual badges for capabilities

### 3. Screenshot Capture (Q Key)

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Keyboard Trigger | Ctrl/Cmd + Q activates crosshair | `useQDragSelection.js:32-38` |
| Drag Selection | Draw rectangle overlay | `useQDragSelection.js:50-63` |
| Region Capture | Crop and save screenshot | `screenshot.rs:25-96` |
| Auto-send to AI | Dispatch event for immediate analysis | `useQDragSelection.js:23` |
| Toast Notification | Show capture confirmation | `App.css:20-45` |

### 4. Window Management

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Custom Title Bar | Draggable region with app icon | `TitleBar.jsx:47-67` |
| Window Controls | Minimize, Maximize, Close | `WindowControls.jsx:24-54` |
| Drag Prevention | No drag when maximized | `TitleBar.jsx:26-45` |
| State Sync | Listen for resize events | `TitleBar.jsx:10-24` |

### 5. Settings

| Feature | Description | Implementation |
|---------|-------------|----------------|
| API Key Storage | localStorage persistence | `SettingsModal.jsx:8-20` |
| Show/Hide Toggle | Password visibility toggle | `SettingsModal.jsx:56-65` |
| Modal Backdrop | Click-outside-to-close | `SettingsModal.jsx:22-26` |

### 6. Keyboard Shortcuts

| Shortcut | Action | Implementation |
|----------|--------|----------------|
| Ctrl+Shift+S | Take screenshot | Registered via Tauri |
| Ctrl+Shift+H | Toggle window | Registered via Tauri |
| Ctrl+Shift+M | Minimize window | Registered via Tauri |
| Ctrl/Cmd+Q | Drag-select screenshot | `useQDragSelection.js` |

### 7. OS Information Display

| Feature | Description | Implementation |
|---------|-------------|----------------|
| OS Type | Display platform name | `os.rs:11-19` |
| Architecture | Display CPU architecture | `os.rs:11-19` |
| Bottom Bar | Persistent status display | `BottomBar.jsx:8-12` |

---

## UI Components Breakdown

### Component Hierarchy

```
App
├── MainView
│   ├── TitleBar
│   │   ├── ModelSelector (dropdown with 12 models)
│   │   └── WindowControls (minimize, maximize, close)
│   ├── ChatMessages (scrollable list)
│   │   └── Message (user/assistant/error variants)
│   ├── ChatInput (text field + send button)
│   ├── BottomBar
│   │   └── OSInfo
│   │   └── SettingsButton
│   ├── SettingsModal (backdrop + dialog)
│   └── KeybindsHelp (dismissible popup)
└── SelectionOverlay (drag rectangle for Q key)
```

### Visual Design System

**Theme Variables (`cyber.css`):**

```css
/* Core Colors */
--primary-bg: #121212        /* Main background */
--secondary-bg: #1e1e1e      /* Title bar, bottom bar */
--card-bg: #252525           /* Message bubbles, modals */
--surface-bg: #2d2d2d        /* Hover states */

/* Accents */
--accent-primary: #0d73ec    /* Blue - primary actions */
--accent-primary-hover: #0059b8
--accent-secondary: #00c3ff  /* Light blue - gradients */

/* Status */
--success-color: #4ade80     /* Green - free models, success */
--warning-color: #fbbf24     /* Yellow - warnings */
--error-color: #f87171       /* Red - errors, paid models */

/* Typography */
--font-sans: 'Inter', system-ui
--font-mono: 'JetBrains Mono', monospace

/* Effects */
--shadow-sm, --shadow-md, --shadow-lg
--glow-primary: 0 0 10px rgba(13, 115, 236, 0.4)
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
```

### Component Specifications

#### 1. TitleBar (Height: 40px)

```
├── Drag Region (flex: 1)
│   ├── App Icon (24x24, ion-icon: pulse-outline)
│   ├── App Title (12px, 500 weight)
│   └── Model Selector (min-width: 160px, height: 28px)
└── Window Controls Container
    ├── Minimize (36x32, remove-outline)
    ├── Maximize/Restore (36x32, square-outline/copy-outline)
    └── Close (36x32, close-outline)
```

**Styling Notes:**
- Gradient accent line on top border
- Hover colors: minimize=warning, maximize=success, close=error
- No drag when maximized

#### 2. Chat Messages Area

```
Position: absolute, bottom: 86px, right: 0
Max-width: 600px, Width: 100%
Padding: 16px, Gap: 12px
```

**Message Bubble:**
- Max-width: 80%
- Padding: 12px 16px
- Border-radius: 12px
- Border: 1px solid var(--border-medium)
- Avatar: 32x32, ion-icon 24px

**User Message:**
- Background: rgb(0, 32, 71)
- Border: var(--accent-primary)
- Align: flex-end

**Assistant Message:**
- Background: var(--surface-bg)
- Border: var(--border-medium)

**Error Message:**
- Background: rgba(248, 113, 113, 0.15)
- Border: var(--error-color)

#### 3. Chat Input (Bottom: 56px)

```
Position: absolute, bottom: 56px, right: 20px
Max-width: 400px
```

**Input Field:**
- Padding: 12px 16px
- Border-radius: 8px
- Background: var(--card-bg)
- Focus: 3px ring rgba(13, 115, 236, 0.3)

**Send Button:**
- Size: 44x44
- Border-radius: 8px
- Hover: background=accent-primary, glow effect

#### 4. Bottom Bar (Height: 38px)

```
├── Left Section (flex: 1)
│   └── OS Info (11px, monospace)
└── Right Section (flex: 1)
    └── Settings Button (28x28, cog icon)
```

#### 5. Settings Modal

```
Max-width: 450px
Border-radius: 12px
Backdrop: blur(4px), rgba(0,0,0,0.7)
```

**Sections:**
- Header: 20px 24px padding, border-bottom
- Content: 24px padding
- Footer: 16px 24px padding, border-top

#### 6. Keybinds Help Popup

```
Position: absolute, top: 80px, right: 20px
Max-width: 280px
Border-radius: 12px
Padding: 16px
```

---

## Backend/API Integration

### Tauri Commands (Rust Backend)

#### 1. `chat_message`

```rust
#[command]
pub async fn chat_message(
    message: String,
    api_key: String,
    model: Option<String>
) -> Result<ChatResult, String>
```

**Request Structure:**
```json
{
  "model": "openai/gpt-3.5-turbo",
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Headers:**
- `Authorization: Bearer {api_key}`
- `Content-Type: application/json`

**Response:**
```json
{
  "success": true,
  "response": "Assistant message here"
}
```

#### 2. `chat_with_image`

```rust
#[command]
pub async fn chat_with_image(
    image_path: String,
    message: String,
    api_key: String,
    model: Option<String>
) -> Result<ChatResult, String>
```

**Vision Request Structure:**
```json
{
  "model": "openai/gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "analyze this image"},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
      ]
    }
  ]
}
```

#### 3. `take_screenshot`

```rust
#[command]
pub async fn take_screenshot(
    params: ScreenshotParams
) -> Result<ScreenshotResult, String>

pub struct ScreenshotParams {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}
```

**Process:**
1. Capture full monitor using `xcap::Monitor::all()`
2. Crop to specified region
3. Save to `Pictures/screenshots/screenshot_{timestamp}.png`
4. Return file path

**Response:**
```json
{
  "success": true,
  "path": "/Users/.../Pictures/screenshots/screenshot_2024-01-01_12-00-00.png",
  "message": "Screenshot saved to ..."
}
```

#### 4. `get_os_info`

```rust
#[command]
pub fn get_os_info() -> Result<OsInfo, String>

pub struct OsInfo {
    pub os_type: String,
    pub arch: String,
}
```

**Response:**
```json
{"os_type": "macos", "arch": "aarch64"}
```

---

## State Management

### Current Approach (React)

| State | Location | Persistence |
|-------|----------|-------------|
| `messages` | `MainView` (useState) | Session only |
| `isLoading` | `MainView` (useState) | Session only |
| `selectedModel` | `ModelSelector` (useState) | localStorage |
| `apiKey` | `SettingsModal` (useState) | localStorage |
| `isSettingsOpen` | `MainView` (useState) | Session only |
| `keybindsDismissed` | `KeybindsHelp` (useState) | localStorage |
| `isMaximized` | `TitleBar` (useState) | Window state |

### localStorage Keys

```javascript
- "api_key"           // User's OpenRouter API key
- "selected_model"    // Currently selected model ID
- "keybinds_help_dismissed" // Whether help popup was dismissed
```

### Events

```javascript
// Custom event for screenshot capture
window.dispatchEvent(new CustomEvent("screenshot-captured", {
  detail: { path: "/path/to/screenshot.png" }
}));
```

---

## Proposed Flutter Architecture

### Recommended Structure

```
lib/
├── main.dart                    # App entry point
├── app.dart                     # MaterialApp configuration
├── config/
│   ├── theme.dart               # Theme data (cyber theme)
│   ├── constants.dart           # App constants
│   └── assets.dart              # Asset paths
├── models/
│   ├── message.dart             # Chat message model
│   ├── model_info.dart          # AI model metadata
│   ├── chat_request.dart        # API request models
│   └── chat_response.dart       # API response models
├── providers/
│   ├── chat_provider.dart       # Chat state management
│   ├── settings_provider.dart   # Settings & preferences
│   └── window_provider.dart     # Window state
├── services/
│   ├── api_service.dart         # OpenRouter HTTP client
│   ├── storage_service.dart     # SharedPreferences wrapper
│   ├── screenshot_service.dart  # Screenshot capture
│   └── keyboard_service.dart    # Global shortcuts
├── ui/
│   ├── screens/
│   │   └── main_screen.dart     # Main chat interface
│   ├── widgets/
│   │   ├── title_bar.dart       # Custom title bar
│   │   ├── model_selector.dart  # Model dropdown
│   │   ├── window_controls.dart # Min/max/close buttons
│   │   ├── chat_messages.dart   # Message list
│   │   ├── message_bubble.dart  # Individual message
│   │   ├── chat_input.dart      # Input field + send button
│   │   ├── bottom_bar.dart      # Status bar
│   │   ├── settings_dialog.dart # Settings modal
│   │   ├── keybinds_help.dart   # Keyboard shortcuts popup
│   │   └── selection_overlay.dart # Drag selection rectangle
│   └── theme/
│       └── cyber_theme.dart     # Theme extensions
└── utils/
    ├── extensions.dart          # Dart extensions
    └── platform_info.dart       # OS detection
```

### State Management Recommendation

**Use Riverpod 2.x** for several reasons:
1. Compile-time safety
2. Better testing support
3. No context dependency
4. Built-in async/loading states
5. Easy composition

Example provider structure:

```dart
// providers/chat_provider.dart
@riverpod
class Chat extends _$Chat {
  @override
  AsyncValue<List<Message>> build() {
    return const AsyncValue.data([]);
  }

  Future<void> sendMessage(String content) async {
    state = const AsyncValue.loading();

    final userMessage = Message.user(content);
    state = AsyncValue.data([...state.value!, userMessage]);

    final apiService = ref.read(apiServiceProvider);
    final model = ref.read(settingsProvider).selectedModel;

    final result = await apiService.chat(content, model);

    state = AsyncValue.data([
      ...state.value!,
      Message.assistant(result.response),
    ]);
  }

  Future<void> analyzeImage(String imagePath) async {
    // Similar pattern for image analysis
  }
}
```

---

## Package Recommendations

### Core Dependencies (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0

  # HTTP & API
  http: ^1.1.0
  dio: ^5.4.0  # Alternative with better error handling

  # Local Storage
  shared_preferences: ^2.2.0
  hive: ^2.2.3  # Optional: faster alternative

  # Window Management (Desktop)
  bitsdojo_window: ^0.1.6  # Custom window chrome
  window_manager: ^0.3.8   # Window control (minimize, maximize)

  # Screenshot
  flutter_screen_capture: ^3.0.0  # Or use platform channels

  # Keyboard Shortcuts
  keyboard_hook: ^0.0.3  # Global shortcuts
  shortcut_manager: ^0.0.5

  # Icons (Ionicons alternative)
  ionicons: ^0.2.2

  # Markdown Rendering (for AI responses)
  flutter_markdown: ^0.6.18

  # Image Handling
  image_picker: ^1.0.0
  image: ^4.1.7  # For image processing

  # Platform Info
  platform: ^3.1.4

dev_dependencies:
  flutter_test:
    sdk: flutter
  riverpod_generator: ^2.3.0
  build_runner: ^2.4.0
  custom_lint: ^0.5.0
  riverpod_lint: ^2.3.0
```

### Platform-Specific Considerations

#### macOS
- Requires entitlements for screen recording
- Use `CGWindowListCreateImage` for screenshots
- Private API access via `NSRunningApplication`

#### Windows
- Use `Desktop Duplication API` or `PrintScreen`
- May need admin privileges for certain captures

#### Linux
- Use `X11` or `Wayland` screenshot APIs
- May require `scrot` or `grim` dependencies

---

## Implementation Guide

### Phase 1: Project Setup

1. **Create Flutter Project**
```bash
flutter create --platforms=linux,macos,windows bun_desktop_ai_assistant
cd bun_desktop_ai_assistant
```

2. **Configure `pubspec.yaml`** with dependencies above

3. **Set up Window Management**
```dart
// main.dart
import 'bitsdojo_window/bitsdojo_window.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  const windowOptions = WindowOptions(
    size: Size(800, 600),
    title: "Bun Desktop AI Assistant",
    titleBarStyle: TitleBarStyle.hidden,
  );

  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
    runApp(const MyApp());
  });
}
```

### Phase 2: Theme & Design System

```dart
// config/theme.dart
import 'package:flutter/material.dart';

class CyberTheme {
  static const Color primaryBg = Color(0xFF121212);
  static const Color secondaryBg = Color(0xFF1E1E1E);
  static const Color cardBg = Color(0xFF252525);
  static const Color surfaceBg = Color(0xFF2D2D2D);

  static const Color accentPrimary = Color(0xFF0D73EC);
  static const Color accentPrimaryHover = Color(0xFF0059B8);
  static const Color accentSecondary = Color(0xFF00C3FF);

  static const Color successColor = Color(0xFF4ADE80);
  static const Color warningColor = Color(0xFFFBBF24);
  static const Color errorColor = Color(0xFFF87171);

  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFCCCCCC);
  static const Color textTertiary = Color(0xFF999999);

  static ThemeData get lightTheme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: primaryBg,
    primaryColor: accentPrimary,
    fontFamily: 'Inter',
    // ... full theme configuration
  );
}
```

### Phase 3: Core Services

#### API Service

```dart
// services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'https://openrouter.ai/api/v1';

  Future<String> chat({
    required String message,
    required String apiKey,
    required String model,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/chat/completions'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'model': model,
        'messages': [
          {'role': 'user', 'content': message},
        ],
      }),
    );

    if (response.statusCode != 200) {
      throw ApiException('API error: ${response.statusCode}');
    }

    final data = jsonDecode(response.body);
    return data['choices'][0]['message']['content'];
  }

  Future<String> chatWithImage({
    required String imagePath,
    required String message,
    required String apiKey,
    required String model,
  }) async {
    // Implement base64 encoding and vision API call
  }
}
```

#### Storage Service

```dart
// services/storage_service.dart
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String apiKeyKey = 'api_key';
  static const String selectedModelKey = 'selected_model';
  static const String keybindsDismissedKey = 'keybinds_help_dismissed';

  Future<String?> getApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(apiKeyKey);
  }

  Future<void> setApiKey(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(apiKeyKey, key);
  }

  // ... other methods
}
```

### Phase 4: Widget Implementation

#### Main Screen Structure

```dart
// ui/screens/main_screen.dart
import 'package:flutter/material.dart';
import '../widgets/';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          const TitleBar(),           // 40px height
          Expanded(
            child: Stack(
              children: [
                const ChatMessages(),  // Scrollable messages
                Positioned(
                  bottom: 56,
                  right: 20,
                  child: const ChatInput(),
                ),
              ],
            ),
          ),
          const BottomBar(),          // 38px height
          const KeybindsHelp(),       // Overlay
        ],
      ),
    );
  }
}
```

#### Custom Title Bar

```dart
// ui/widgets/title_bar.dart
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'model_selector.dart';
import 'window_controls.dart';

class TitleBar extends StatelessWidget {
  const TitleBar({super.key});

  @override
  Widget build(BuildContext context) {
    return MoveWindow(
      child: Container(
        height: 40,
        decoration: BoxDecoration(
          color: CyberTheme.secondaryBg,
          border: Border(
            bottom: BorderSide(color: CyberTheme.borderSubtle),
          ),
        ),
        child: Row(
          children: [
            const SizedBox(width: 16),
            const Icon(Icons.pulse, color: CyberTheme.accentPrimary, size: 24),
            const SizedBox(width: 12),
            const Text(
              'Bun Desktop AI Assistant',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: CyberTheme.textPrimary,
              ),
            ),
            const SizedBox(width: 12),
            const ModelSelector(),
            const Spacer(),
            const WindowControls(),
          ],
        ),
      ),
    );
  }
}
```

#### Chat Messages with Animations

```dart
// ui/widgets/chat_messages.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'message_bubble.dart';

class ChatMessages extends ConsumerWidget {
  const ChatMessages({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatState = ref.watch(chatProvider);

    return chatState.when(
      data: (messages) => ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: messages.length,
        itemBuilder: (context, index) {
          return AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: MessageBubble(
              key: ValueKey(messages[index].id),
              message: messages[index],
            ),
          );
        },
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('Error: $error')),
    );
  }
}
```

### Phase 5: Screenshot Capture

Implement platform-specific screenshot using method channels:

```dart
// services/screenshot_service.dart
import 'dart:io';
import 'package:flutter/services.dart';

class ScreenshotService {
  static const platform = MethodChannel('bun_desktop_ai_assistant/screenshot');

  Future<String> captureRegion({
    required int x,
    required int y,
    required int width,
    required int height,
  }) async {
    try {
      final result = await platform.invokeMethod('captureRegion', {
        'x': x,
        'y': y,
        'width': width,
        'height': height,
      });
      return result as String;
    } on PlatformException catch (e) {
      throw ScreenshotException('Failed to capture: ${e.message}');
    }
  }
}
```

**Platform Channel Implementation (Kotlin/Swift):**

For macOS (`macos/Runner/MainFlutterWindow.swift`):
```swift
import Cocoa
import FlutterMacOS

class MainFlutterWindow: NSWindow {
  override func awakeFromNib() {
    // ... existing setup

    let controller = FlutterViewController.init()
    let screenshotChannel = FlutterMethodChannel(
      name: "bun_desktop_ai_assistant/screenshot",
      binaryMessenger: engine.binaryMessenger
    )

    screenshotChannel.setMethodCallHandler { [weak self] call, result in
      if call.method == "captureRegion" {
        self?.captureRegion(arguments: call.arguments, result: result)
      }
    }
  }

  private func captureRegion(arguments: Any?, result: @escaping FlutterResult) {
    // Implement CGWindowListCreateImage capture
  }
}
```

### Phase 6: Keyboard Shortcuts

```dart
// services/keyboard_service.dart
import 'package:keyboard_hook/keyboard_hook.dart';

class KeyboardService {
  final _keyboardHook = KeyboardHook();

  void initialize(Function(String shortcut) onShortcut) {
    _keyboardHook.registerKeyCombination(
      [KeyEventControlKey, KeyEventShiftKey, KeyEventSKey],
      () => onShortcut('Ctrl+Shift+S'),
    );

    // Q key for screenshot selection
    _keyboardHook.registerKeyDownHandler((event) {
      if (event.controlKey && event.key == 'q') {
        // Start selection mode
      }
    });
  }
}
```

---

## Code Mapping: React/Rust → Flutter

| React/Rust Component | Flutter Equivalent |
|---------------------|-------------------|
| `MainView.jsx` | `MainScreen` |
| `TitleBar.jsx` | `TitleBar` widget |
| `ModelSelector.jsx` | `ModelSelector` with `PopupMenuButton` |
| `WindowControls.jsx` | `WindowControls` using `window_manager` |
| `chat_messages` | `ListView.builder` with `ChatMessages` |
| `Message` bubble | `MessageBubble` widget |
| `SettingsModal.jsx` | `SettingsDialog` (Dialog widget) |
| `KeybindsHelp.jsx` | `KeybindsHelp` (Positioned overlay) |
| `useQDragSelection.js` | `SelectionOverlay` + `KeyboardService` |
| `chat_message` (Rust) | `ApiService.chat()` |
| `chat_with_image` (Rust) | `ApiService.chatWithImage()` |
| `take_screenshot` (Rust) | `ScreenshotService.captureRegion()` |
| `get_os_info` (Rust) | `Platform.operatingSystem` |
| `localStorage` | `SharedPreferences` |
| `invoke()` | Direct Dart function calls |

---

## Testing Strategy

### Unit Tests
```dart
// test/services/api_service_test.dart
void main() {
  group('ApiService', () {
    test('chat sends correct request format', () async {
      // Mock HTTP client
      // Verify request structure
    });

    test('chat handles API errors', () async {
      // Test error response handling
    });
  });
}
```

### Widget Tests
```dart
// test/widgets/message_bubble_test.dart
void main() {
  testWidgets('displays user message correctly', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: MessageBubble(message: Message.user('Hello')),
      ),
    );
    expect(find.text('Hello'), findsOneWidget);
  });
}
```

### Integration Tests
```dart
// test_integration/app_test.dart
void main() {
  testWidgets('full chat flow', (tester) async {
    // Launch app
    // Type message
    // Send
    // Verify response displayed
  });
}
```

---

## Performance Considerations

1. **Message List Performance**
   - Use `ListView.builder` for lazy loading
   - Implement `key` for proper AnimatedSwitcher behavior
   - Consider pagination for long histories

2. **Image Handling**
   - Compress images before base64 encoding
   - Use `compute()` for heavy image processing
   - Cache processed images

3. **State Updates**
   - Use `AsyncValue` for proper loading states
   - Batch state updates where possible
   - Avoid rebuilding entire chat on each message

4. **Memory Management**
   - Dispose controllers properly
   - Clear old messages if history grows large
   - Use `AutomaticKeepAliveClientMixin` sparingly

---

## Security Considerations

1. **API Key Storage**
   - Use `flutter_secure_storage` for encryption
   - Never log API keys
   - Validate key format before saving

2. **File System Access**
   - Request minimal permissions
   - Validate file paths
   - Clean up temporary files

3. **Network Security**
   - Enforce HTTPS
   - Validate API responses
   - Handle rate limiting gracefully

---

## Build & Distribution

### macOS
```bash
flutter build macos --release
# Sign with developer certificate
# Notarize for distribution
```

### Windows
```bash
flutter build windows --release
# Sign with Authenticode certificate
# Create MSIX or EXE installer
```

### Linux
```bash
flutter build linux --release
# Create AppImage, deb, or snap
```

---

## Migration Checklist

- [ ] Set up Flutter project with desktop platforms
- [ ] Configure window management (bitsdojo_window)
- [ ] Implement theme system (CyberTheme)
- [ ] Create model classes (Message, ModelInfo, etc.)
- [ ] Set up Riverpod providers
- [ ] Implement ApiService with OpenRouter
- [ ] Implement StorageService (SharedPreferences)
- [ ] Build TitleBar widget
- [ ] Build ModelSelector widget
- [ ] Build WindowControls widget
- [ ] Build ChatMessages list
- [ ] Build MessageBubble widget
- [ ] Build ChatInput widget
- [ ] Build BottomBar widget
- [ ] Build SettingsDialog
- [ ] Build KeybindsHelp popup
- [ ] Implement screenshot capture (platform channels)
- [ ] Implement keyboard shortcuts
- [ ] Implement selection overlay for Q key
- [ ] Add markdown rendering for responses
- [ ] Add typing indicator animation
- [ ] Implement error handling
- [ ] Add toast notifications
- [ ] Write unit tests
- [ ] Write widget tests
- [ ] Write integration tests
- [ ] Build and test on all platforms
- [ ] Create app icons
- [ ] Configure code signing
- [ ] Prepare store listings

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Setup & Theme | 2-3 days | Project structure, theme system |
| Core Services | 2-3 days | API, Storage, Platform services |
| UI Components | 5-7 days | All widgets implemented |
| Screenshot Feature | 3-4 days | Platform channels, selection overlay |
| Polish & Testing | 4-5 days | Animations, tests, bug fixes |
| **Total** | **16-22 days** | Production-ready Flutter app |

---

## Notes & Considerations

### Advantages of Flutter Rewrite

1. **Single codebase** for all platforms
2. **No webview overhead** - native rendering
3. **Better performance** for animations
4. **Easier distribution** (single binary)
5. **Consistent UI** across platforms

### Challenges

1. **Platform-specific screenshot** requires native code
2. **Global keyboard hooks** need platform channels
3. **Window management** less mature than Tauri
4. **Larger binary size** (~20-40MB vs ~5MB)

### Recommended Approach

Consider a **hybrid migration**:
1. Keep Tauri backend for screenshot/window management
2. Migrate UI to Flutter for embedding
3. Use Flutter's platform views to embed existing Tauri functionality

Or go **full Flutter** if:
- You need mobile support in the future
- You want better animation performance
- You prefer Dart over Rust/React
