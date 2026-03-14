# Bun Desktop AI Assistant

A cross-platform desktop AI assistant application built with Tauri and React. The application features a cyber-themed interface with neon purple accents, allowing users to interact with multiple AI models through text and image analysis.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## Features

- **AI Chat Interface**: Text and image-based conversations with AI models
- **Screenshot Capture**: Area selection tool (Ctrl+Q) for AI-powered image analysis
- **Model Selection**: 12+ supported models including OpenAI GPT, Anthropic Claude, Google Gemini, Meta Llama, and Mistral
- **Customizable Settings**: Secure API key management with localStorage persistence
- **Modern Cyber UI**: Dark themed interface with neon accents, built with React 19 and Framer Motion
- **Keyboard Shortcuts**: Ctrl+Q for area screenshot, Ctrl+W for maximize/restore

## Tech Stack

- **Frontend**: React 19, Vite, Framer Motion for animations
- **Backend**: Rust with Tauri v2 framework for native desktop integration
- **UI/UX**: CSS custom properties, Ionicons
- **Build Tools**: Bun, Vite, Rust/Cargo

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/docs/installation) (v1 or higher)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bun-desktop-ai-assistant
```

2. Install dependencies:
```bash
bun install
```

3. Run the development server (frontend only):
```bash
npm run dev
```

4. In another terminal, run the Tauri application:
```bash
npm run tauri dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Build desktop application
npm run tauri build
```

## Project Structure

```
bun-desktop-ai-assistant/
├── src/                         # React frontend source code
│   ├── components/              # UI components
│   │   ├── BottomBar.jsx        # Bottom status bar
│   │   ├── ModelSelector.jsx    # AI model dropdown selector
│   │   ├── SettingsModal.jsx    # API key configuration modal
│   │   ├── TitleBar.jsx         # Draggable title bar
│   │   ├── ToastNotification    # Toast notification component
│   │   └── WindowControls.jsx   # Min/Max/Close buttons
│   ├── hooks/                   # Custom React hooks
│   │   ├── useQDragSelection.js # Area screenshot selection
│   │   ├── useWScreenshot.js    # Fullscreen screenshot
│   │   ├── useCrosshairCursor.js# Crosshair cursor state
│   │   └── useToggleMaximize.js # Maximize via keyboard
│   ├── theme/                   # Theme files
│   │   └── cyber.css            # Cyber theme CSS variables
│   ├── utils/                   # Utility functions
│   ├── views/                   # Page components
│   │   └── MainView.jsx         # Main chat interface
│   ├── App.jsx                  # Root component
│   └── main.jsx                 # Entry point
├── src-tauri/                   # Rust backend source code
│   ├── src/
│   │   ├── commands/            # Tauri command handlers
│   │   └── lib.rs               # Main Rust entry point
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── docs/                        # Documentation
│   └── ui-documentation.md      # Detailed UI documentation
├── AGENTS.md                    # Agent development guidelines
├── package.json                 # Frontend dependencies
└── README.md                    # This file
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Q` | Activate area screenshot selection tool |
| `Ctrl+W` | Toggle window maximize/restore |

## Supported AI Models

The application supports 12+ AI models across different providers:

- **OpenAI**: GPT-3.5-turbo, GPT-4-turbo, GPT-4o, GPT-4o-mini
- **Anthropic**: Claude 3 Haiku, Claude 3 Sonnet, Claude 3 Opus
- **Google**: Gemini Pro 1.5
- **Meta**: Llama 3 8B Instruct, Llama 3 70B Instruct
- **Mistral**: Mistral Small, Mistral Large

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Available Scripts

All scripts are defined in `package.json`:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (React frontend only) |
| `npm run tauri dev` | Run full Tauri application in development mode |
| `npm run build` | Build production frontend assets |
| `npm run tauri build` | Build distributable desktop application |
| `npm run preview` | Preview built frontend locally |

## Dependencies

### Frontend
- `@tauri-apps/api` - Tauri APIs for frontend communication
- `@tauri-apps/plugin-opener` - File opener plugin for desktop operations
- `framer-motion` - Animation library for smooth UI transitions
- `ionicons` - Icon library
- `react` & `react-dom` - Core frontend framework (v19)

### Development
- `@tauri-apps/cli` - Tauri CLI for building desktop applications
- `@vitejs/plugin-react` - Vite plugin for React support
- `vite` - Build tool and dev server

## Documentation

- [UI Documentation](./docs/ui-documentation.md) - Detailed UI component documentation
- [Agent Guidelines](./AGENTS.md) - Development guidelines for AI agents

## Contributing

This project follows standard React and Rust conventions. All contributions are welcome.

Please read the [AGENTS.md](./AGENTS.md) file for development guidelines and coding standards.

## License

This project is licensed under [MIT](LICENSE).
