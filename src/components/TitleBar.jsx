import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import { ModelSelector } from "./ModelSelector";
import { WindowControls } from "./WindowControls";
import "./TitleBar.css";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();

    // Listen for resize events to track maximized state
    const unlistenMaximize = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });

    // Initial check
    appWindow.isMaximized().then(setIsMaximized);

    return () => {
      unlistenMaximize.then((fn) => fn());
    };
  }, []);

  const handleDragStart = async (e) => {
    console.log('[TitleBar] handleDragStart - type:', e.type, 'button:', e.button, 'buttons:', e.buttons);

    // Only allow left button drag
    if (e.button !== 0) {
      console.log('[TitleBar] Ignoring - not left button');
      return;
    }

    // Only drag if not maximized
    if (isMaximized) {
      console.log('[TitleBar] Ignoring - window is maximized');
      return;
    }

    console.log('[TitleBar] Starting drag...');
    const appWindow = getCurrentWebviewWindow();
    await appWindow.startDragging();
    console.log('[TitleBar] Drag started');
  };

  return (
    <div
      className="title-bar"
      onMouseDown={handleDragStart}
      onMouseUp={(e) => console.log('[TitleBar] mouseUp - button:', e.button)}
      onTouchStart={(e) => console.log('[TitleBar] touchStart')}
    >
      <div className="title-bar-drag-region">
        <div className="app-icon">
          <ion-icon name="pulse-outline"></ion-icon>
        </div>
        <span className="app-title">Bun Desktop AI Assistant</span>
        <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}>
          <ModelSelector />
        </div>
      </div>
      <div className="window-controls-container" onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}>
        <WindowControls />
      </div>
    </div>
  );
}
