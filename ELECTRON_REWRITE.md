# Bun Desktop AI Assistant - Electron + React Rewrite Specification

Complete technical specification for rewriting this Tauri + React application in Electron + React for cross-platform desktop.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Current Architecture](#current-architecture)
3. [Features & Functionality](#features--functionality)
4. [UI Components Breakdown](#ui-components-breakdown)
5. [Backend/API Integration](#backendapi-integration)
6. [State Management](#state-management)
7. [Proposed Electron Architecture](#proposed-electron-architecture)
8. [Package Recommendations](#package-recommendations)
9. [Implementation Guide](#implementation-guide)
10. [Security Considerations](#security-considerations)
11. [Build & Distribution](#build--distribution)

---

## Application Overview

**Current Stack:**
- **Frontend:** React 19 + Vite
- **Backend:** Tauri 2.x (Rust)
- **AI Integration:** OpenRouter API (multi-provider)
- **Platform:** Desktop (macOS, Windows, Linux)

**Target Stack:**
- **Frontend:** React 19 + Vite (same framework, easier migration)
- **Backend:** Electron Main Process (Node.js/TypeScript)
- **AI Integration:** OpenRouter API (unchanged)
- **Platform:** Desktop (macOS, Windows, Linux)

**App Purpose:** A desktop AI chat assistant supporting:
- Text-based conversations with multiple AI models
- Image analysis (vision models)
- Region screenshot capture for quick image analysis
- Model selection from 12+ providers (OpenAI, Anthropic, Google, Meta, Mistral)

---

## Current Architecture

### Layer Diagram (Current Tauri)

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
                         │ invoke() - IPC
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

### Target Architecture (Electron)

```
┌─────────────────────────────────────────────────────┐
│                  Renderer Process (React)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ TitleBar │ │ MainView │ │BottomBar │ │Settings│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ModelSelect│ │Keybinds │ │DragSelection (Q key) │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         │ ipcRenderer.invoke() - IPC
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Main Process (Node.js)             │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ chat_message │ │chat_with_img│ │take_screenshot││
│  └──────────────┘ └──────────────┘ └─────────────┘ │
│  ┌──────────────┐ ┌──────────────┐                 │
│  │ get_os_info  │ │Window Control│                 │
│  └──────────────┘ └──────────────┘                 │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              Preload Script                    │ │
│  │         (contextBridge exposure)               │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP (axios/node-fetch)
                         ▼
            ┌────────────────────────┐
            │   OpenRouter API       │
            │   (AI Model Gateway)   │
            └────────────────────────┘
```

---

## Features & Functionality

### 1. Chat Interface

| Feature | Description | Current Implementation |
|---------|-------------|----------------------|
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

| Feature | Description | Current Implementation |
|---------|-------------|----------------------|
| Keyboard Trigger | Ctrl/Cmd + Q activates crosshair | `useQDragSelection.js:32-38` |
| Drag Selection | Draw rectangle overlay | `useQDragSelection.js:50-63` |
| Region Capture | Crop and save screenshot | `screenshot.rs:25-96` |
| Auto-send to AI | Dispatch event for immediate analysis | `useQDragSelection.js:23` |
| Toast Notification | Show capture confirmation | `App.css:20-45` |

### 4. Window Management

| Feature | Description | Current Implementation |
|---------|-------------|----------------------|
| Custom Title Bar | Draggable region with app icon | `TitleBar.jsx:47-67` |
| Window Controls | Minimize, Maximize, Close | `WindowControls.jsx:24-54` |
| Drag Prevention | No drag when maximized | `TitleBar.jsx:26-45` |
| State Sync | Listen for resize events | `TitleBar.jsx:10-24` |

### 5. Settings

| Feature | Description | Current Implementation |
|---------|-------------|----------------------|
| API Key Storage | localStorage persistence | `SettingsModal.jsx:8-20` |
| Show/Hide Toggle | Password visibility toggle | `SettingsModal.jsx:56-65` |
| Modal Backdrop | Click-outside-to-close | `SettingsModal.jsx:22-26` |

### 6. Keyboard Shortcuts

| Shortcut | Action | Current Implementation |
|----------|--------|----------------------|
| Ctrl+Shift+S | Take screenshot | Registered via Tauri |
| Ctrl+Shift+H | Toggle window | Registered via Tauri |
| Ctrl+Shift+M | Minimize window | Registered via Tauri |
| Ctrl/Cmd+Q | Drag-select screenshot | `useQDragSelection.js` |

### 7. OS Information Display

| Feature | Description | Current Implementation |
|---------|-------------|----------------------|
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
│   │   ├── OSInfo
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
- `-webkit-app-region: drag` for draggable area
- `-webkit-app-region: no-drag` for interactive elements

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

### Tauri Commands (Current Rust Backend)

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

**Process:**
1. Read image file
2. Convert to base64
3. Create data URL
4. Send to OpenRouter vision API

#### 3. `take_screenshot`

```rust
#[command]
pub async fn take_screenshot(
    params: ScreenshotParams
) -> Result<ScreenshotResult, String>
```

**Process:**
1. Capture full monitor using `xcap::Monitor::all()`
2. Crop to specified region
3. Save to `Pictures/screenshots/screenshot_{timestamp}.png`
4. Return file path

#### 4. `get_os_info`

```rust
#[command]
pub fn get_os_info() -> Result<OsInfo, String>
```

**Response:**
```json
{"os_type": "macos", "arch": "aarch64"}
```

---

## State Management

### Current Approach (React + localStorage)

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

### IPC Events (Tauri → Electron)

| Current (Tauri) | Target (Electron) |
|----------------|-------------------|
| `invoke('chat_message', ...)` | `ipcRenderer.invoke('chat:message', ...)` |
| `invoke('chat_with_image', ...)` | `ipcRenderer.invoke('chat:image', ...)` |
| `invoke('take_screenshot', ...)` | `ipcRenderer.invoke('screenshot:capture', ...)` |
| `invoke('get_os_info')` | `ipcRenderer.invoke('system:info')` |
| Custom event dispatch | `ipcRenderer.send()` / `ipcMain.on()` |

---

## Proposed Electron Architecture

### Recommended Structure

```
bun-desktop-ai-assistant/
├── package.json
├── electron/
│   ├── main.ts                    # Main process entry point
│   ├── preload.ts                 # Preload script (contextBridge)
│   ├── electron-env.d.ts          # TypeScript declarations
│   ├── ipc/
│   │   ├── handlers.ts            # IPC command handlers
│   │   └── channels.ts            # IPC channel constants
│   ├── services/
│   │   ├── chat.service.ts        # OpenRouter API calls
│   │   ├── screenshot.service.ts  # Screenshot capture
│   │   └── system.service.ts      # OS info, platform detection
│   ├── utils/
│   │   ├── logger.ts              # Logging utility
│   │   └── paths.ts               # File path utilities
│   └── window/
│       └── main-window.ts         # Main window management
├── src/
│   ├── main.tsx                   # React entry point (unchanged)
│   ├── App.tsx                    # Root component (unchanged)
│   ├── components/
│   │   ├── TitleBar.tsx           # Custom title bar
│   │   ├── ModelSelector.tsx      # Model dropdown
│   │   ├── WindowControls.tsx     # Min/max/close buttons
│   │   ├── BottomBar.tsx          # Status bar
│   │   ├── SettingsModal.tsx      # Settings dialog
│   │   └── KeybindsHelp.tsx       # Keyboard shortcuts help
│   ├── views/
│   │   └── MainView.tsx           # Main chat interface
│   ├── hooks/
│   │   ├── useQDragSelection.ts   # Screenshot selection hook
│   │   └── useToggleMaximize.ts   # Window maximize hook
│   ├── utils/
│   │   └── services/
│   │       └── ipc.ts             # IPC wrapper (replaces tauri.ts)
│   └── theme/
│       └── cyber.css              # Theme variables (unchanged)
├── resources/
│   ├── icon.icns                  # macOS icon
│   ├── icon.ico                   # Windows icon
│   └── icon.png                   # Linux icon
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
└── electron-builder.json          # Build configuration
```

### State Management Recommendation

**Keep existing React state management** - The current useState + localStorage approach works well for this app size. Consider upgrading to:

1. **Zustand** - Lightweight, minimal boilerplate
2. **Jotai** - Atomic state, great for React 18+
3. **Redux Toolkit** - If app grows significantly

For now, the current approach is fine. The only change needed is the IPC layer.

---

## Package Recommendations

### Core Dependencies (`package.json`)

```json
{
  "name": "bun-desktop-ai-assistant",
  "version": "0.1.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "electron:dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "ionicons": "^8.0.13",
    "axios": "^1.6.0",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^20.0.0",
    "@vitejs/plugin-react": "^4.6.0",
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "typescript": "^5.0.0",
    "vite": "^7.0.0",
    "vite-plugin-electron": "^0.28.0",
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0"
  }
}
```

### Alternative: Using electron-vite template

```bash
npm create electron-vite@latest bun-desktop-ai-assistant -- --template react-ts
```

This provides a pre-configured setup with:
- Vite for frontend bundling
- TypeScript support
- Hot reload for both processes
- Build configuration

---

## Implementation Guide

### Phase 1: Project Setup

#### Option A: Manual Setup

1. **Initialize Project**
```bash
# Keep existing React files
npm install --save-dev electron electron-builder vite-plugin-electron
npm install axios electron-store
```

2. **Create `electron/main.ts`**
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false, // Frameless window
    transparent: true, // Transparent background
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load Vite dev server in development
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

3. **Create `electron/preload.ts`**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Define the API exposed to renderer
export interface ElectronAPI {
  chat: {
    message: (message: string, apiKey: string, model?: string) => Promise<{ success: boolean; response: string }>;
    withImage: (imagePath: string, message: string, apiKey: string, model?: string) => Promise<{ success: boolean; response: string }>;
  };
  screenshot: {
    capture: (x: number, y: number, width: number, height: number) => Promise<{ success: boolean; path: string; message: string }>;
  };
  system: {
    getOSInfo: () => Promise<{ os_type: string; arch: string }>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    startDragging: () => Promise<void>;
    onMaximized: (callback: (isMaximized: boolean) => void) => () => void;
  };
}

contextBridge.exposeInMainWorld('electronAPI', {
  chat: {
    message: (message: string, apiKey: string, model?: string) =>
      ipcRenderer.invoke('chat:message', { message, apiKey, model }),
    withImage: (imagePath: string, message: string, apiKey: string, model?: string) =>
      ipcRenderer.invoke('chat:image', { imagePath, message, apiKey, model }),
  },
  screenshot: {
    capture: (x: number, y: number, width: number, height: number) =>
      ipcRenderer.invoke('screenshot:capture', { x, y, width, height }),
  },
  system: {
    getOSInfo: () => ipcRenderer.invoke('system:getOSInfo'),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    startDragging: () => ipcRenderer.invoke('window:startDragging'),
    onMaximized: (callback: (isMaximized: boolean) => void) => {
      const listener = (_event: any, isMaximized: boolean) => callback(isMaximized);
      ipcRenderer.on('window:maximized', listener);
      return () => ipcRenderer.removeListener('window:maximized', listener);
    },
  },
});
```

4. **Create `electron/ipc/handlers.ts`**
```typescript
import { ipcMain, BrowserWindow, dialog } from 'electron';
import { ChatService } from '../services/chat.service';
import { ScreenshotService } from '../services/screenshot.service';
import { SystemService } from '../services/system.service';

export function registerIPCHandlers() {
  // Chat handlers
  ipcMain.handle('chat:message', async (_event, { message, apiKey, model }) => {
    return ChatService.sendMessage(message, apiKey, model);
  });

  ipcMain.handle('chat:image', async (_event, { imagePath, message, apiKey, model }) => {
    return ChatService.sendWithImage(imagePath, message, apiKey, model);
  });

  // Screenshot handler
  ipcMain.handle('screenshot:capture', async (_event, { x, y, width, height }) => {
    return ScreenshotService.captureRegion({ x, y, width, height });
  });

  // System handler
  ipcMain.handle('system:getOSInfo', async () => {
    return SystemService.getOSInfo();
  });

  // Window handlers
  ipcMain.handle('window:minimize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.handle('window:maximize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  ipcMain.handle('window:startDragging', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.startDragging();
  });
}
```

5. **Create `electron/services/chat.service.ts`**
```typescript
import axios from 'axios';

interface ChatRequest {
  model: string;
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
}

interface ChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export class ChatService {
  private static readonly BASE_URL = 'https://openrouter.ai/api/v1';

  static async sendMessage(
    message: string,
    apiKey: string,
    model?: string
  ): Promise<{ success: boolean; response: string }> {
    if (!apiKey) {
      throw new Error('API key is required. Please set your API key in settings.');
    }

    const request: ChatRequest = {
      model: model || 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    };

    try {
      const response = await axios.post<ChatResponse>(
        `${this.BASE_URL}/chat/completions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || 'No response from API';
      return { success: true, response: content };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }

  static async sendWithImage(
    imagePath: string,
    message: string,
    apiKey: string,
    model?: string
  ): Promise<{ success: boolean; response: string }> {
    if (!apiKey) {
      throw new Error('API key is required. Please set your API key in settings.');
    }

    const fs = await import('fs');
    const imageBytes = fs.readFileSync(imagePath);
    const base64Image = imageBytes.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    const request: ChatRequest = {
      model: model || 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: message },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    };

    try {
      const response = await axios.post<ChatResponse>(
        `${this.BASE_URL}/chat/completions`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || 'No response from API';
      return { success: true, response: content };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
}
```

6. **Create `electron/services/screenshot.service.ts`**
```typescript
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

interface ScreenshotParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ScreenshotService {
  static async captureRegion(
    params: ScreenshotParams
  ): Promise<{ success: boolean; path: string; message: string }> {
    // Platform-specific screenshot capture
    const platform = process.platform;

    if (platform === 'darwin') {
      return this.captureMacOS(params);
    } else if (platform === 'win32') {
      return this.captureWindows(params);
    } else {
      return this.captureLinux(params);
    }
  }

  private static async captureMacOS(
    params: ScreenshotParams
  ): Promise<{ success: boolean; path: string; message: string }> {
    const { execSync } = await import('child_process');

    // Get screenshots directory
    const picturesDir = app.getPath('pictures');
    const screenshotsDir = path.join(picturesDir, 'screenshots');

    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.png`;
    const filePath = path.join(screenshotsDir, filename);

    // Use screencapture command with -R for region
    const region = `${params.x},${params.y},${params.width},${params.height}`;
    execSync(`screencapture -R${region} "${filePath}"`);

    return {
      success: true,
      path: filePath,
      message: `Screenshot saved to ${filePath}`,
    };
  }

  private static async captureWindows(
    params: ScreenshotParams
  ): Promise<{ success: boolean; path: string; message: string }> {
    // Use PowerShell to capture screenshot
    const { execSync } = await import('child_process');

    const picturesDir = app.getPath('pictures');
    const screenshotsDir = path.join(picturesDir, 'screenshots');

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.png`;
    const filePath = path.join(screenshotsDir, filename);

    // PowerShell script for region screenshot
    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
      $screen = [System.Windows.Forms.Screen]::PrimaryScreen
      $bitmap = New-Object System.Drawing.Bitmap $screen.Bounds.Width, $screen.Bounds.Height
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
      $region = New-Object System.Drawing.Rectangle ${params.x}, ${params.y}, ${params.width}, ${params.height}
      $cropped = $bitmap.Clone($region, $bitmap.PixelFormat)
      $cropped.Save("${filePath.replace(/\\/g, '\\\\')}")
      $graphics.Dispose()
      $bitmap.Dispose()
      $cropped.Dispose()
    `;

    execSync(`powershell -Command "${script}"`);

    return {
      success: true,
      path: filePath,
      message: `Screenshot saved to ${filePath}`,
    };
  }

  private static async captureLinux(
    params: ScreenshotParams
  ): Promise<{ success: boolean; path: string; message: string }> {
    const { execSync } = await import('child_process');

    const picturesDir = app.getPath('pictures');
    const screenshotsDir = path.join(picturesDir, 'screenshots');

    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.png`;
    const filePath = path.join(screenshotsDir, filename);

    // Try scrot first, fall back to gnome-screenshot
    try {
      execSync(`scrot -a ${params.x},${params.y},${params.width},${params.height} "${filePath}"`);
    } catch {
      try {
        execSync(`gnome-screenshot -a -f "${filePath}"`);
      } catch (error) {
        throw new Error('Screenshot tool not found. Please install scrot or gnome-screenshot.');
      }
    }

    return {
      success: true,
      path: filePath,
      message: `Screenshot saved to ${filePath}`,
    };
  }
}
```

7. **Create `electron/services/system.service.ts`**
```typescript
import os from 'os';

export class SystemService {
  static getOSInfo(): { os_type: string; arch: string } {
    const platform = os.platform();
    const arch = os.arch();

    let osType: string;
    switch (platform) {
      case 'darwin':
        osType = 'macos';
        break;
      case 'win32':
        osType = 'windows';
        break;
      case 'linux':
        osType = 'linux';
        break;
      default:
        osType = platform;
    }

    return {
      os_type: osType,
      arch: arch,
    };
  }
}
```

### Phase 2: Update Vite Configuration

**`vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
          },
        },
      },
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

### Phase 3: Update React IPC Layer

**`src/utils/services/ipc.ts`** (replaces `tauri.ts`)
```typescript
import type { ElectronAPI } from '../../electron/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

/**
 * Send a chat message to AI
 */
export async function chatMessage(
  message: string,
  apiKey: string,
  model?: string
): Promise<{ success: boolean; response: string }> {
  return window.electronAPI.chat.message(message, apiKey, model);
}

/**
 * Send an image for AI analysis
 */
export async function chatWithImage(
  imagePath: string,
  message: string,
  apiKey: string,
  model?: string
): Promise<{ success: boolean; response: string }> {
  return window.electronAPI.chat.withImage(imagePath, message, apiKey, model);
}

/**
 * Capture a region screenshot
 */
export async function takeScreenshot(
  x: number,
  y: number,
  width: number,
  height: number
): Promise<{ success: boolean; path: string; message: string }> {
  return window.electronAPI.screenshot.capture(x, y, width, height);
}

/**
 * Get OS information
 */
export async function getOSInfo(): Promise<{ os_type: string; arch: string }> {
  return window.electronAPI.system.getOSInfo();
}

/**
 * Window management functions
 */
export const windowControls = {
  minimize: () => window.electronAPI.window.minimize(),
  maximize: () => window.electronAPI.window.maximize(),
  close: () => window.electronAPI.window.close(),
  startDragging: () => window.electronAPI.window.startDragging(),
  onMaximized: (callback: (isMaximized: boolean) => void) =>
    window.electronAPI.window.onMaximized(callback),
};
```

### Phase 4: Update Components

#### Update `MainView.jsx` - Replace Tauri invoke

```typescript
// Before (Tauri)
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("chat_message", { message, apiKey, model });

// After (Electron)
import { chatMessage, chatWithImage } from "@/utils/services/ipc";
const result = await chatMessage(message, apiKey, model);
```

#### Update `TitleBar.jsx` - Replace window functions

```typescript
// Before (Tauri)
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const appWindow = getCurrentWebviewWindow();
await appWindow.startDragging();

// After (Electron)
import { windowControls } from "@/utils/services/ipc";
await windowControls.startDragging();
```

#### Update `WindowControls.jsx`

```typescript
// Before (Tauri)
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
const appWindow = getCurrentWebviewWindow();
await appWindow.minimize();

// After (Electron)
import { windowControls } from "@/utils/services/ipc";
await windowControls.minimize();
```

#### Update `BottomBar.jsx`

```typescript
// Before (Tauri)
import { invoke } from "@tauri-apps/api/core";
const osInfo = await invoke("get_os_info");

// After (Electron)
import { getOSInfo } from "@/utils/services/ipc";
const osInfo = await getOSInfo();
```

#### Update `useQDragSelection.js`

```typescript
// Before (Tauri)
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("take_screenshot", { params: { x, y, width, height } });

// After (Electron)
import { takeScreenshot } from "@/utils/services/ipc";
const result = await takeScreenshot(x, y, width, height);
```

### Phase 5: TypeScript Declarations

**`electron/electron-env.d.ts`**
```typescript
/// <reference types="vite-plugin-electron/types" />

import type { ElectronAPI } from './preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

**`src/vite-env.d.ts`**
```typescript
/// <reference types="vite/client" />

import type { ElectronAPI } from '../electron/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### Phase 6: Build Configuration

**`electron-builder.json`**
```json
{
  "appId": "com.arthur.bun-desktop-ai-assistant",
  "productName": "Bun Desktop AI Assistant",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*"
  ],
  "mac": {
    "icon": "resources/icon.icns",
    "target": ["dmg", "zip"],
    "category": "public.app-category.productivity"
  },
  "win": {
    "icon": "resources/icon.ico",
    "target": ["nsis", "portable"]
  },
  "linux": {
    "icon": "resources/icon.png",
    "target": ["AppImage", "deb"]
  }
}
```

---

## Security Considerations

### 1. Context Isolation

**Always enable context isolation:**
```typescript
// preload.ts
webPreferences: {
  contextIsolation: true,  // MUST be true
  nodeIntegration: false,  // MUST be false
  preload: path.join(__dirname, 'preload.js'),
}
```

### 2. Limited IPC Exposure

**Only expose necessary APIs:**
```typescript
// Good: Specific, typed API
contextBridge.exposeInMainWorld('electronAPI', {
  chat: { message: ... },
  screenshot: { capture: ... },
});

// Bad: Too broad
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),  // DANGEROUS
});
```

### 3. Input Validation

**Validate all IPC inputs in main process:**
```typescript
ipcMain.handle('screenshot:capture', async (event, params) => {
  // Validate params
  if (typeof params.x !== 'number' || params.x < 0) {
    throw new Error('Invalid x coordinate');
  }
  // ... validate other params
  return ScreenshotService.captureRegion(params);
});
```

### 4. API Key Security

**Never store API keys in plain text:**
```typescript
// Use electron-store with encryption
import Store from 'electron-store';

const store = new Store({
  encryptionKey: 'your-encryption-key',  // Use secure key derivation
});

// Store encrypted
store.set('api_key', encrypt(apiKey));

// Retrieve decrypted
const apiKey = decrypt(store.get('api_key'));
```

### 5. CSP (Content Security Policy)

**Set strict CSP in main process:**
```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
      ],
    },
  });
});
```

---

## Build & Distribution

### Development

```bash
# Start Vite dev server + Electron
npm run electron:dev

# Or manually
npm run dev          # Terminal 1: Vite
npx electron .       # Terminal 2: Electron (after Vite starts)
```

### Production Build

```bash
# Build for current platform
npm run electron:build

# Build for specific platform
npm run electron:build -- --mac
npm run electron:build -- --win
npm run electron:build -- --linux

# Build for all platforms
npm run electron:build -- --mac --win --linux
```

### Code Signing

#### macOS
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
```

#### Windows
```json
{
  "win": {
    "sign": "build/sign.js",
    "signingHashAlgorithms": ["sha256"],
    "signingCertUrl": "https://your-cert-provider.com"
  }
}
```

### Auto-Update (Optional)

```typescript
// main.ts
import { autoUpdater } from 'electron-updater';

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

ipcMain.handle('check-for-updates', () => {
  return autoUpdater.checkForUpdates();
});
```

---

## Code Mapping: Tauri → Electron

| Tauri (React/Rust) | Electron Equivalent |
|-------------------|---------------------|
| `invoke('command')` | `ipcRenderer.invoke('channel')` |
| `@tauri-apps/api/core` | Custom IPC wrapper |
| `@tauri-apps/api/webviewWindow` | `BrowserWindow` via IPC |
| Rust commands | Node.js service classes |
| `tauri.conf.json` | `electron-builder.json` + `vite.config.ts` |
| `Cargo.toml` | `package.json` devDependencies |
| `src-tauri/src/` | `electron/` |
| `src/` | `src/` (mostly unchanged) |

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
// test/services/chat.service.test.ts
import { ChatService } from '../../electron/services/chat.service';

describe('ChatService', () => {
  it('throws error without API key', async () => {
    await expect(ChatService.sendMessage('test', '')).rejects.toThrow('API key is required');
  });

  it('sends correct request format', async () => {
    // Mock axios
    // Verify request structure
  });
});
```

### E2E Tests (Playwright)

```typescript
// test/e2e/app.spec.ts
import { test, expect, _electron as electron } from '@playwright/test';

test('app launches successfully', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();
  await expect(window).toBeVisible();
  await app.close();
});

test('can send chat message', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();

  await window.fill('input[type="text"]', 'Hello');
  await window.click('button[type="submit"]');

  // Wait for response
  await window.waitForSelector('.message.assistant');
  await app.close();
});
```

---

## Performance Considerations

### 1. Memory Management

- Electron apps use more memory than Tauri (~100-200MB vs ~30-50MB)
- Use `webContents.session.clearCache()` periodically
- Implement proper cleanup in `window.on('closed')`

### 2. Startup Time

- Lazy load heavy dependencies
- Use `app.whenReady()` properly
- Consider `--enable-features=ElectronSerialChooser` for faster IPC

### 3. Bundle Size

- Use webpack/vite tree shaking
- Exclude unnecessary modules
- Consider ASAR packaging

---

## Migration Checklist

- [ ] Install Electron and dependencies
- [ ] Create `electron/main.ts` with window configuration
- [ ] Create `electron/preload.ts` with contextBridge
- [ ] Create IPC handlers for all Tauri commands
- [ ] Create service classes (chat, screenshot, system)
- [ ] Update Vite configuration for Electron
- [ ] Update React components to use new IPC layer
- [ ] Add TypeScript declarations
- [ ] Configure electron-builder
- [ ] Test development mode
- [ ] Test production build on macOS
- [ ] Test production build on Windows
- [ ] Test production build on Linux
- [ ] Implement code signing (if needed)
- [ ] Add auto-update support (optional)
- [ ] Write unit tests
- [ ] Write E2E tests
- [ ] Update documentation
- [ ] Create app icons
- [ ] Prepare store listings

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Setup & Configuration | 1-2 days | Project structure, build config |
| Main Process Implementation | 2-3 days | IPC handlers, services |
| Preload & IPC Layer | 1-2 days | contextBridge, TypeScript types |
| Component Updates | 2-3 days | Updated React components |
| Testing & Polish | 2-3 days | Tests, bug fixes |
| Build & Distribution | 1-2 days | Signed builds, installers |
| **Total** | **9-15 days** | Production-ready Electron app |

---

## Advantages Over Tauri

| Aspect | Tauri | Electron |
|--------|-------|----------|
| **Binary Size** | ~5-10 MB | ~80-150 MB |
| **Memory Usage** | ~30-50 MB | ~100-200 MB |
| **Startup Time** | Fast | Moderate |
| **Node.js Ecosystem** | Limited | Full access |
| **Developer Pool** | Smaller (Rust) | Larger (JavaScript) |
| **Plugin Ecosystem** | Growing | Mature |
| **Debugging** | Good | Excellent |
| **Cross-platform** | Yes | Yes |

### Why Choose Electron for This App

1. **Same React codebase** - Minimal frontend changes needed
2. **Node.js screenshot libraries** - More mature than Rust alternatives
3. **Easier hiring** - More JavaScript developers than Rust
4. **Better debugging** - Chrome DevTools for both processes
5. **Larger ecosystem** - More npm packages for future features

### Trade-offs

- **Larger bundle size** - Acceptable for desktop apps
- **Higher memory** - Still reasonable for modern systems
- **Security model** - Requires careful IPC design (but well-understood)

---

## Quick Start Commands

```bash
# Clone and install
git clone <your-repo>
cd bun-desktop-ai-assistant
npm install

# Development
npm run electron:dev

# Build
npm run electron:build

# Test
npm test
```

---

## Troubleshooting

### Common Issues

1. **Blank screen in development**
   - Ensure Vite dev server is running
   - Check `VITE_DEV_SERVER_URL` in main.ts

2. **IPC not working**
   - Verify preload script is loaded
   - Check `contextIsolation: true`
   - Ensure channel names match

3. **Screenshot fails on Linux**
   - Install `scrot` or `gnome-screenshot`
   - Check X11 permissions

4. **Window not frameless**
   - Verify `frame: false` in BrowserWindow options
   - Check CSS for `-webkit-app-region: drag`

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [Vite Plugin Electron](https://github.com/electron-vite/vite-plugin-electron)
- [Electron Fiddle](https://www.electronjs.org/fiddle) - Quick prototyping
- [Electron Forge](https://www.electronforge.io/) - Alternative build tool
