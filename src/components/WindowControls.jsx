import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./WindowControls.css";

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
  hover: {
    scale: 1.1,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const iconVariants = {
  idle: { rotate: 0 },
  hover: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

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
      <motion.button
        className="control-button minimize"
        onClick={handleMinimize}
        title="Minimize"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.div
          variants={iconVariants}
          initial="idle"
          whileHover="hover"
        >
          <ion-icon name="remove-outline"></ion-icon>
        </motion.div>
      </motion.button>
      <motion.button
        className="control-button maximize"
        onClick={handleMaximize}
        title={isMaximized ? "Restore" : "Maximize"}
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        transition={{ delay: 0.05 }}
      >
        <motion.div
          variants={iconVariants}
          initial="idle"
          whileHover="hover"
        >
          {isMaximized ? (
            <ion-icon name="copy-outline"></ion-icon>
          ) : (
            <ion-icon name="square-outline"></ion-icon>
          )}
        </motion.div>
      </motion.button>
      <motion.button
        className="control-button close"
        onClick={handleClose}
        title="Close"
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        transition={{ delay: 0.1 }}
      >
        <motion.div
          variants={iconVariants}
          initial="idle"
          whileHover="hover"
        >
          <ion-icon name="close-outline"></ion-icon>
        </motion.div>
      </motion.button>
    </div>
  );
}
