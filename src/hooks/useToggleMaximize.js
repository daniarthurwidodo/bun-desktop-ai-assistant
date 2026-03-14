import { useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export function useToggleMaximize() {
  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();

    const handleKeyDown = (e) => {
      const tagName = document.activeElement?.tagName?.toLowerCase();
      if (tagName === "input" || tagName === "textarea") return;

      if (e.key.toLowerCase() === "w" && e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        appWindow.toggleMaximize();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
