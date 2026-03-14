import { useEffect, useState } from "react";

export function useCrosshairCursor() {
  const [isCrosshair, setIsCrosshair] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "q" && e.ctrlKey && !e.repeat) {
        setIsCrosshair(true);
        document.body.style.cursor = "crosshair";
      }
    };

    const handleKeyUp = (e) => {
      if (e.key.toLowerCase() === "q" && e.ctrlKey) {
        setIsCrosshair(false);
        document.body.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.body.style.cursor = "default";
    };
  }, []);

  return isCrosshair;
}
