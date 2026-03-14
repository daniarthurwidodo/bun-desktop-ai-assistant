import { MainView } from "./views";
import { useQDragSelection, useToggleMaximize } from "./hooks";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const { isSelecting, isCapturing, screenshotTaken, rectStyle } = useQDragSelection();
  useToggleMaximize();

  return (
    <>
      <MainView />
      {isSelecting && (
        <div className="selection-rectangle" style={rectStyle} />
      )}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            className="screenshot-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ion-icon name="camera-outline"></ion-icon>
            <span>Capturing...</span>
          </motion.div>
        )}
        {screenshotTaken && (
          <motion.div
            className="screenshot-toast success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ion-icon name="checkmark-circle-outline"></ion-icon>
            <span>Screenshot saved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
