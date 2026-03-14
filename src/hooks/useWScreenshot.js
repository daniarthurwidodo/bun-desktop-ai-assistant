import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useWScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotTaken, setScreenshotTaken] = useState(false);

  const takeFullscreenScreenshot = useCallback(async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    try {
      // Get screen dimensions for fullscreen capture
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      const result = await invoke("take_screenshot", {
        params: { x: 0, y: 0, width: screenWidth, height: screenHeight }
      });
      console.log("Fullscreen screenshot saved:", result);
      setScreenshotTaken(true);
      setTimeout(() => setScreenshotTaken(false), 2000);
    } catch (error) {
      console.error("Failed to take fullscreen screenshot:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  return {
    isCapturing,
    screenshotTaken,
    takeFullscreenScreenshot,
  };
}
