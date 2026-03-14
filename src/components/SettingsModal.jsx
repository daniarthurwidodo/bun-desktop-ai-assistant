import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import "./SettingsModal.css";

export function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem("api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("api_key", apiKey);
    console.log("API key saved");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-modal-backdrop"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="settings-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-modal-header">
              <h2>Settings</h2>
              <button className="modal-close" onClick={onClose}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>

            <div className="settings-modal-content">
              <div className="setting-group">
                <label htmlFor="api-key">API Key</label>
                <div className="api-key-input-wrapper">
                  <input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    <ion-icon
                      name={showApiKey ? "eye-off-outline" : "eye-outline"}
                    ></ion-icon>
                  </button>
                </div>
                <p className="setting-hint">
                  Your API key is stored locally and never sent to our servers
                </p>
              </div>
            </div>

            <div className="settings-modal-footer">
              <motion.button
                className="save-button"
                onClick={handleSaveApiKey}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
