import { MainView } from "./views";
import { useQDragSelection, useToggleMaximize } from "./hooks";
import { ToastProvider } from "./components/ToastNotification";
import "./App.css";

function App() {
  const { isSelecting, isCapturing, screenshotTaken, rectStyle } = useQDragSelection();
  useToggleMaximize();

  return (
    <ToastProvider>
      <MainView />
      {isSelecting && (
        <div className="selection-rectangle" style={rectStyle} />
      )}
      {isCapturing && (
        <div className="screenshot-toast">
          <ion-icon name="camera-outline"></ion-icon>
          <span>Capturing...</span>
        </div>
      )}
      {screenshotTaken && (
        <div className="screenshot-toast success">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <span>Screenshot saved!</span>
        </div>
      )}
    </ToastProvider>
  );
}

export default App;
