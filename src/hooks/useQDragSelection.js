import { useEffect, useState, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useQDragSelection() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [screenshotTaken, setScreenshotTaken] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const isQPressedRef = useRef(false);

  const takeScreenshot = useCallback(async (x, y, width, height) => {
    if (isCapturing) return;

    setIsCapturing(true);
    try {
      const result = await invoke("take_screenshot", {
        params: { x, y, width, height }
      });
      console.log("Screenshot saved:", result);
      setScreenshotTaken(true);
      setTimeout(() => setScreenshotTaken(false), 2000);
      window.dispatchEvent(new CustomEvent("screenshot-captured", { detail: { path: result.path } }));
    } catch (error) {
      console.error("Failed to take screenshot:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Support both Ctrl (Windows/Linux) and Cmd (macOS)
      if (e.key.toLowerCase() === "q" && (e.ctrlKey || e.metaKey) && !e.repeat) {
        isQPressedRef.current = true;
        document.body.style.cursor = "crosshair";
        document.documentElement.style.cursor = "crosshair";
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === "q" || e.key === "Control" || e.key === "Meta") {
        isQPressedRef.current = false;
        setIsSelecting(false);
        document.body.style.cursor = "default";
        document.documentElement.style.cursor = "default";
      }
    };

    const handleMouseDown = (e) => {
      if (isQPressedRef.current && e.buttons === 1) {
        setIsSelecting(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setEndPos({ x: e.clientX, y: e.clientY });
        setScreenshotTaken(false);
      }
    };

    const handleMouseMove = (e) => {
      if (isQPressedRef.current && isSelecting) {
        setEndPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = async () => {
      if (isQPressedRef.current && isSelecting) {
        setIsSelecting(false);

        // Calculate the rectangle coordinates
        const x = Math.min(startPos.x, endPos.x);
        const y = Math.min(startPos.y, endPos.y);
        const width = Math.abs(endPos.x - startPos.x);
        const height = Math.abs(endPos.y - startPos.y);

        // Only take screenshot if selection is large enough
        if (width > 10 && height > 10) {
          await takeScreenshot(x, y, width, height);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      document.documentElement.style.cursor = "default";
    };
  }, [isSelecting, startPos, endPos, takeScreenshot]);

  // Calculate rectangle position and size
  const getRectStyle = () => {
    const left = Math.min(startPos.x, endPos.x);
    const top = Math.min(startPos.y, endPos.y);
    const width = Math.abs(endPos.x - startPos.x);
    const height = Math.abs(endPos.y - startPos.y);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return {
    isSelecting,
    isCapturing,
    screenshotTaken,
    rectStyle: getRectStyle(),
    startPos,
    endPos,
  };
}
