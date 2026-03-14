import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./BottomBar.css";

const cogVariants = {
  initial: { rotate: 0 },
  hover: {
    rotate: 180,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  tap: {
    rotate: 225,
    transition: { duration: 0.3 },
  },
};

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
        <motion.button
          className="bottom-bar-cog-button"
          onClick={onSettingsClick}
          variants={cogVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          title="Settings"
        >
          <ion-icon name="settings-outline"></ion-icon>
        </motion.button>
      </div>
    </div>
  );
}
