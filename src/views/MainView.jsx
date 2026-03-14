import { TitleBar, SettingsModal, BottomBar } from "../components";
import { useToast } from "../components/ToastNotification";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./MainView.css";

// Define the capabilities for each model
const MODEL_CAPABILITIES = {
  "openai/gpt-3.5-turbo": ["text"],
  "openai/gpt-4-turbo": ["text", "image"],
  "openai/gpt-4o": ["text", "image"],
  "openai/gpt-4o-mini": ["text", "image"],
  "anthropic/claude-3-haiku": ["text", "image"],
  "anthropic/claude-3-sonnet": ["text", "image"],
  "anthropic/claude-3-opus": ["text", "image"],
  "google/gemini-pro-1.5": ["text", "image"],
  "meta-llama/llama-3-8b-instruct": ["text"],
  "meta-llama/llama-3-70b-instruct": ["text"],
  "mistralai/mistral-small": ["text"],
  "mistralai/mistral-large": ["text"],
};

export function MainView() {
  const { addToast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {

    const sendImageToChat = async (imagePath) => {
      // Get selected model
      const model = localStorage.getItem("selected_model") || "openai/gpt-3.5-turbo";
      const modelCapabilities = MODEL_CAPABILITIES[model] || [];
      
      // Check if the selected model supports images
      if (!modelCapabilities.includes("image")) {
        // Show a toast notification
        addToast(`Model "${model}" does not support image analysis. Please choose a vision-compatible model.`, "warning", 5000);
        return;
      }
      
      const userMessage = "analyze this image";
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);

      try {
        const apiKey = localStorage.getItem("api_key") || "";
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

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
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
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
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
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !message.trim()}
          >
            <ion-icon name="send"></ion-icon>
          </button>
        </form>
      </div>
      <BottomBar onSettingsClick={handleSettingsClick} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}