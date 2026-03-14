import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import "./WindowControls.css";

export function WindowControls() {
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

  const handleMinimize = async () => {
    const appWindow = getCurrentWebviewWindow();
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const appWindow = getCurrentWebviewWindow();
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    const appWindow = getCurrentWebviewWindow();
    await appWindow.close();
  };

  return (
    <div className="window-controls">
      <button className="control-button minimize" onClick={handleMinimize} title="Minimize">
        <ion-icon name="remove-outline"></ion-icon>
      </button>
      <button className="control-button maximize" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
        {isMaximized ? (
          <ion-icon name="copy-outline"></ion-icon>
        ) : (
          <ion-icon name="square-outline"></ion-icon>
        )}
      </button>
      <button className="control-button close" onClick={handleClose} title="Close">
        <ion-icon name="close-outline"></ion-icon>
      </button>
    </div>
  );
}
