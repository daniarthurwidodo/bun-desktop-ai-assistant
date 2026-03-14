import React, { createContext, useContext, useState } from "react";
import "./ToastNotification.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastNotifications />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function getToastIcon(type) {
  switch (type) {
    case "success": return "checkmark-circle-outline";
    case "error": return "alert-circle-outline";
    case "warning": return "warning-outline";
    case "info": default: return "information-circle-outline";
  }
}

function getToastClass(type) {
  return `toast ${type}`;
}

function ToastNotifications() {
  const { toasts, removeToast } = useContext(ToastContext);
  
  return (
    <div className="toast-container">
      {toasts.map(({ id, message, type, duration }) => (
          <ToastItem 
            key={id} 
            id={id} 
            message={message} 
            type={type} 
            duration={duration}
            onRemove={() => removeToast(id)} 
          />
      ))}
    </div>
  );
}

function ToastItem({ id, message, type, duration, onRemove }) {
  return (
    <div
      className={getToastClass(type)}
    >
      <ion-icon className="toast-icon" name={getToastIcon(type)}></ion-icon>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => onRemove()}>
        <ion-icon name="close-outline"></ion-icon>
      </button>
    </div>
  );
}

export default ToastProvider;