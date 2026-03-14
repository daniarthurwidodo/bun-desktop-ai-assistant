import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./BottomBar.css";

export function BottomBar({ onSettingsClick }) {
  const [osInfo, setOsInfo] = useState(null);

  useEffect(() => {
    invoke("get_os_info")
      .then(setOsInfo)
      .catch((err) => console.error("Failed to get OS info:", err));
  }, []);

  return (
    <div className="bottom-bar">
      <div className="bottom-bar-left">
        {osInfo && (
          <div className="bottom-bar-os-info">
            <ion-icon name="desktop-outline"></ion-icon>
            <span>{osInfo.os_type} ({osInfo.arch})</span>
          </div>
        )}
      </div>
      <div className="bottom-bar-right">
        <button
          className="bottom-bar-cog-button"
          onClick={onSettingsClick}
          title="Settings"
        >
          <ion-icon name="settings-outline"></ion-icon>
        </button>
      </div>
    </div>
  );
}
