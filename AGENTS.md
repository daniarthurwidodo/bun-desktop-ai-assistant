# Agent Guidelines for Bun Desktop AI Assistant

## Build Commands

### Project Initialization
```bash
bun install                    # Install all dependencies
```

### Build System (Vite + Tauri)
```bash
# Development server (React frontend only)
npm run dev

# Full Tauri development build (with React frontend auto-start)
npm run tauri dev

# Build production app
npm run build                   # Build React frontend
npm run tauri build            # Package as desktop app
```

### Preview Production Build
```bash
# View built frontend
npm run preview

# Tauri bundle and run
npm run tauri build && npm run tauri run
```

## Lint/Format Commands

### Current State
- No explicit linting configured (no ESLint/Prettier configs found)
- No automated formatting setup detected
- **Recommendation**: Set up linters/formatting manually if needed

## Test Commands

### Current Testing State
- No test files found (**.test.*, **.spec.*)
- No testing framework configured
- **Recommendation**: Add Jest, Vitest, or React Testing Library for comprehensive testing
- **Future**: Consider adding unit tests for both React components and Rust functions

### Running Individual Tests (when added)
```bash
# Currently not configured
# After adding tests with Vitest:
# npm run test:unit <path-to-test-file.spec.ts>

# For Tauri backend tests:
# cd src-tauri && cargo test
```

## Overall Architecture

- **Frontend**: React 19 with Vite
- **Backend**: Rust with Tauri framework
- **Desktop**: Tauri native desktop integration
- **Styling**: CSS modules and inline styles
- **State management**: React hooks
- **Communication**: Tauri invoke commands between frontend and backend

## Import Conventions

### JavaScript/JSX
- Use absolute imports from src directory:
  ```javascript
  import { ComponentName } from "./components/ComponentName";
  import { hookName } from "./hooks/HookFileName";
  import { utils } from "./utils/UtilsFileName";
  ```
- Third-party libraries above application imports
- Tauri APIs from `@tauri-apps/api`
- Place side effects (CSS imports) last

### Rust
- Follow Rust module system, grouping by feature
- `use` statements organized top-level first
- Tauri imports clearly separated
- Error handling modules near top

## Formatting Standards

### JavaScript/TS
- Use semicolons consistently
- Two space indentation
- Single quotes for strings internally
- Double quotes for HTML attributes in JSX
- Curly braces for all control blocks
- Arrow functions preferred for short callbacks
- Consistent object destructuring

### Rust
- Standard Rust formatting (rustfmt friendly)
- Modules defined separately with `pub mod`
- Error handling with `Result` types
- Clippy-friendly patterns
- Proper attribute annotations (`#[cfg_attr]`, etc.)

## Type Safety

### JavaScript
- Use PropTypes or TypeScript for component prop validation (should migrate to TypeScript)
- Validate external data at boundaries
- Prefer `const` over `let` when possible
- Explicit return types in hook functions

### Rust  
- Proper error handling with Result types
- Input validation at API boundaries
- Follow Rust ownership conventions

## Naming Conventions

### Components
- PascalCase: `UserProfile.jsx`
- Function components: descriptive names
- File name matches export name

### Hooks
- `use` prefix: `useScreenshot.js`
- Return object with descriptive property names
- Group related state/logic in custom hooks

### CSS Classes  
- BEM-like convention: `component-name__element--modifier`
- Semantic names: `title-bar`, `window-controls`, `screenshot-toast`

### Rust Functions
- `snake_case`: `take_screenshot`  
- Descriptive names for commands: `chat_message`, `get_os_info`
- Prefix with module intent: `commands::screenshot::`

## Error Handling

### JavaScript
- Use try/catch around async operations
- Provide user feedback for errors
- Fallback UI states
- Tauri command error handling

### Rust
- Proper `Result<T, E>` return types
- Use `tracing` for debugging/info logging
- Handle edge cases appropriately
- Return meaningful error messages to frontend

## Security Practices

- CSP policy set to `null` (review for specific restrictions)
- Sanitize all data passed between frontend/backend
- Validate and sanitize image/screen capture data  
- Review file system access permissions (`tauri-plugin-fs`)
- Check command inputs for injection vulnerabilities  

## Tauri Integration Patterns

### Frontend Backend Communication
- Tauri commands for async RPC calls: `invoke('command_name', args)`
- Proper serialization/deserialization between JS-Rust
- Error handling for invoke calls
- Loading states when waiting for backend responses

### Permissions
- Defined in `tauri.conf.json` capabilities section
- Secure defaults with minimal required permissions
- Check security policies regularly

## Component Structure  

### React Components
- Function components with hooks
- Props validation where needed
- Consistent composition patterns
- Separation of presentation and logic

### State Management
- Local component state with useState/useReducer
- Global state via Context (TBD if needed)
- Custom hooks for reusable logic
- External state for complex interactions  

### Styling Approach
- CSS files with semantic names
- Component-scoped styles with suffix names
- CSS variables in `theme/` directory
- Inline styles for dynamic values
- Animation with Framer Motion

## Rust Backend Structure

### Modular Design
- Command separation by domain (`commands/chat.rs`, `commands/screenshot.rs`)
- Clear API boundaries with typed parameters/return values
- Tracing instrumentation with `tracing` crate
- Error handling with `anyhow` or custom error types (to be added)  

### Available Commands
- `take_screenshot`: Cross-platform OS screenshot
- `get_os_info`: System information retrieval
- `chat_message`: Text-based AI interaction
- `chat_with_image`: Vision-based AI interaction

## Testing Strategy (Recommended)

### Frontend Testing
- Unit tests for individual components
- Integration tests for component compositions
- Visual regression tests for UI consistency
- Mocked API/network requests

### Backend Testing
- Unit tests for Rust functions  
- Integration coverage of all Tauri commands
- Property-based testing where appropriate
- Performance metrics gathering

## Future Considerations

### Potential Improvements
- Add TypeScript for static analysis
- Implement proper form validation
- Add internationalization support  
- Implement proper caching mechanisms
- Add end-to-end testing suite
- Configure automated release pipeline
- Performance monitoring and analytics

### Recommended Tools to Add
- ESLint with React plugin
- Prettier for consistent formatting
- Husky for pre-commit hooks
- Vitest/Jest for React testing
- Testing library for component testing

## Specialized Agent Skills

### Frontend Designer Skill
For tasks involving visual design, interface layout, and styling, agents can utilize the frontend designer skill:
- Design and implement aesthetically pleasing user interfaces
- Convert design mockups into clean, efficient code
- Implement responsive layouts that work across different device sizes
- Optimize for accessibility and usability best practices
- Apply modern UI/UX principles
- Use appropriate animations and transitions for feedback
- Ensure cross-browser compatibility
- Follow established design systems and style guides

To activate this specialization when appropriate, use the skill tool with name "frontend-designer" during design-focused tasks.

