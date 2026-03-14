import { useState, useEffect } from "react";
import "./ModelSelector.css";

const MODELS = [
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", pricing: "free", capabilities: ["text"] },
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI", pricing: "paid", capabilities: ["text", "image"] },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", pricing: "paid", capabilities: ["text", "image"] },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", pricing: "free", capabilities: ["text", "image"] },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic", pricing: "free", capabilities: ["text", "image"] },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic", pricing: "paid", capabilities: ["text", "image"] },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", pricing: "paid", capabilities: ["text", "image"] },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google", pricing: "free", capabilities: ["text", "image"] },
  { id: "meta-llama/llama-3-8b-instruct", name: "Llama 3 8B", provider: "Meta", pricing: "free", capabilities: ["text"] },
  { id: "meta-llama/llama-3-70b-instruct", name: "Llama 3 70B", provider: "Meta", pricing: "free", capabilities: ["text"] },
  { id: "mistralai/mistral-small", name: "Mistral Small", provider: "Mistral", pricing: "free", capabilities: ["text"] },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral", pricing: "paid", capabilities: ["text"] },
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
      <button
        className="model-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ion-icon name="layers-outline"></ion-icon>
        <span className="model-name">{currentModel.name}</span>
        <span className={`model-badge ${currentModel.pricing}`}>
          {currentModel.pricing === "free" ? "Free" : "Paid"}
        </span>
        <span className="capability-tags">
          {currentModel.capabilities.includes("image") && (
            <span className="capability-tag image">IMG</span>
          )}
          {!currentModel.capabilities.includes("image") && (
            <span className="capability-tag text-only">TXT</span>
          )}
        </span>
        <ion-icon
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          className="chevron"
        ></ion-icon>
      </button>

      {isOpen && (
        <div className="model-dropdown">
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
                <div className="model-option-meta">
                  <div className="model-option-badges">
                    <span className={`model-option-badge ${model.pricing}`}>
                      {model.pricing === "free" ? "Free" : "Paid"}
                    </span>
                    {model.capabilities.includes("image") && (
                      <span className="capability-tag image">IMG</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
