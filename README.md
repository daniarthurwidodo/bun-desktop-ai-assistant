# Bun Desktop AI Assistant

A cross-platform desktop AI assistant application built with Tauri and React. The application allows users to interact with AI models, capture screenshots, and perform various AI-powered tasks through an intuitive desktop interface.

## Features

- **AI Chat Interface**: Text and image-based conversations with AI models
- **Screenshot Capture**: Cross-platform screenshot functionality with selection tools
- **Model Selection**: Switch between different AI models for various tasks
- **Customizable Settings**: Personalized AI assistant options and configuration
- **Modern UI**: Clean, responsive interface built with React 19

## Tech Stack

- **Frontend**: React 19, Vite, Framer Motion for animations
- **Backend**: Rust with Tauri framework for native desktop integration
- **UI/UX**: CSS modules, Ionicons
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

3. Run the development server:
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
├── src/                    # React frontend source code
│   ├── components/        # Reusable UI components (Buttons, Modals, etc.)
│   ├── hooks/            # Custom React hooks (useCrosshairCursor, useWScreenshot, etc.)
│   ├── theme/            # Theme files and constants
│   └── views/            # Page components
└── src-tauri/            # Rust backend source code
    ├── src/
    │   ├── commands/     # Backend command handlers (screenshot, chat, OS info)
    │   └── lib.rs        # Main application entry point
    ├── Cargo.toml        # Rust dependencies
    └── tauri.conf.json   # Tauri configuration
```

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

- @tauri-apps/api - Tauri APIs for frontend communication
- @tauri-apps/plugin-opener - File opener plugin for desktop operations
- framer-motion - Animation library for smooth UI transitions
- ionicons - Icon library
- react & react-dom - Core frontend framework

## Contributing

This project follows standard React and Rust conventions. All contributions are welcome.

## License

This project is licensed under [MIT](LICENSE).
