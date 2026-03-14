import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import "./ModelSelector.css";

const MODELS = [
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", pricing: "free" },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", pricing: "paid" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", pricing: "paid" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", pricing: "free" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", pricing: "free" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic", pricing: "paid" },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", pricing: "paid" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google", pricing: "free" },
  { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B", provider: "Meta", pricing: "free" },
  { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B", provider: "Meta", pricing: "free" },
  { id: "mistralai/mistral-small", name: "Mistral Small", provider: "Mistral", pricing: "free" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", pricing: "paid" },
];

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem("selected_model") || "openai/gpt-3.5-turbo";
  });

  useEffect(() => {
    localStorage.setItem("selected_model", selectedModel);
  }, [selectedModel]);

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  const handleSelect = (modelId) => {
    setSelectedModel(modelId);
    setIsOpen(false);
  };

  return (
    <div className="model-selector">
      <motion.button
        className="model-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ion-icon name="layers-outline"></ion-icon>
        <span className="model-name">{currentModel.name}</span>
        <span className={`model-badge ${currentModel.pricing}`}>
          {currentModel.pricing === "free" ? "Free" : "Paid"}
        </span>
        <ion-icon
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          className="chevron"
        ></ion-icon>
      </motion.button>

      {isOpen && (
        <motion.div
          className="model-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="model-list">
            {MODELS.map((model) => (
              <button
                key={model.id}
                className={`model-option ${selectedModel === model.id ? "selected" : ""}`}
                onClick={() => handleSelect(model.id)}
              >
                <div className="model-option-info">
                  <span className="model-option-name">{model.name}</span>
                  <span className="model-option-provider">{model.provider}</span>
                </div>
                <span className={`model-option-badge ${model.pricing}`}>
                  {model.pricing === "free" ? "Free" : "Paid"}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
