import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
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
    // Only drag if not maximized
    if (isMaximized) return;

    const appWindow = getCurrentWebviewWindow();
    if (e.buttons === 1) {
      await appWindow.startDragging();
    }
  };

  return (
    <div
      className="title-bar"
      onMouseDown={handleDragStart}
    >
      <div className="title-bar-drag-region">
        <div className="app-icon">
          <ion-icon name="pulse-outline"></ion-icon>
        </div>
        <span className="app-title">Bun Desktop AI Assistant</span>
      </div>
      <div className="window-controls-container">
        <WindowControls />
      </div>
    </div>
  );
}
