import { TitleBar, SettingsModal, ModelSelector } from "../components";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./MainView.css";

const cogVariants = {
  initial: { rotate: 0 },
  hover: {
    rotate: 180,
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  tap: {
    rotate: 225,
    transition: { duration: 0.3 }
  }
};

export function MainView() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [osInfo, setOsInfo] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkOs = async () => {
      try {
        const info = await invoke("get_os_info");
        setOsInfo(info);
        console.log("OS Info:", info);
      } catch (err) {
        console.error("Failed to get OS info:", err);
      }
    };

    checkOs();
  }, []);

  useEffect(() => {
    const sendImageToChat = async (imagePath) => {
      const userMessage = "analyze this image";
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);
      try {
        const apiKey = localStorage.getItem("api_key") || "";
        const model = localStorage.getItem("selected_model") || "openai/gpt-4o";
        const result = await invoke("chat_with_image", {
          imagePath,
          message: userMessage,
          apiKey,
          model,
        });
        setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
      } catch (error) {
        console.error("Failed to analyze screenshot:", error);
        setMessages((prev) => [...prev, { role: "error", content: `Error: ${error}` }]);
      } finally {
        setIsLoading(false);
      }
    };

    const handler = (e) => sendImageToChat(e.detail.path);
    window.addEventListener("screenshot-captured", handler);
    return () => window.removeEventListener("screenshot-captured", handler);
  }, []);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Get API key from localStorage
      const apiKey = localStorage.getItem("api_key") || "";
      // Get selected model from localStorage
      const model = localStorage.getItem("selected_model") || "openai/gpt-3.5-turbo";

      // Call Rust backend
      const result = await invoke("chat_message", {
        message: userMessage,
        apiKey,
        model
      });

      // Add assistant response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [...prev, { role: "error", content: `Error: ${error}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main-view">
      <TitleBar />
      <ModelSelector />
      <motion.button
        className="settings-button"
        onClick={handleSettingsClick}
        variants={cogVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        <ion-icon name="settings-outline"></ion-icon>
      </motion.button>
      {osInfo && (
        <div className="os-info">
          <ion-icon name="desktop-outline"></ion-icon>
          <span>{osInfo.os_type} ({osInfo.arch})</span>
        </div>
      )}

      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`message ${msg.role}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-avatar">
                <ion-icon
                  name={
                    msg.role === "user"
                      ? "person-circle-outline"
                      : msg.role === "error"
                      ? "alert-circle-outline"
                      : "chatbubble-ellipses-outline"
                  }
                ></ion-icon>
              </div>
              <div className="message-content">{msg.content}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            className="message assistant loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="message-avatar">
              <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          className="send-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading || !message.trim()}
        >
          <ion-icon name="send"></ion-icon>
        </motion.button>
      </form>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
