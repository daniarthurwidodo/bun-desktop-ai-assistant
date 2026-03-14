import { useState, useEffect } from "react";
import "./KeybindsHelp.css";

const KEYBINDS = [
  { key: "Ctrl+Shift+S", description: "Take a screenshot" },
  { key: "Ctrl+Shift+H", description: "Toggle window" },
  { key: "Ctrl+Shift+M", description: "Minimize window" },
];

export function KeybindsHelp() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("keybinds_help_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("keybinds_help_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="keybinds-help">
      <div className="keybinds-header">
        <h4>Keyboard Shortcuts</h4>
        <button
          className="keybinds-dismiss"
          onClick={handleDismiss}
          title="Don't show again"
        >
          <ion-icon name="close"></ion-icon>
        </button>
      </div>
      <div className="keybinds-list">
        {KEYBINDS.map((bind) => (
          <div key={bind.key} className="keybind-item">
            <kbd className="keybind-key">{bind.key}</kbd>
            <span className="keybind-description">{bind.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
