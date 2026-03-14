use serde::{Deserialize, Serialize};
use tauri::command;
use tracing::{info, error};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub id: String,
    pub choices: Vec<Choice>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Choice {
    pub index: u32,
    pub message: ChatMessage,
}

#[derive(Debug, Serialize)]
pub struct ChatResult {
    pub success: bool,
    pub response: String,
}

#[command]
pub async fn chat_message(message: String, api_key: String, model: Option<String>) -> Result<ChatResult, String> {
    info!("Processing chat message: {}", message);

    // Validate API key is provided
    if api_key.is_empty() {
        return Err("API key is required. Please set your API key in settings.".to_string());
    }

    let client = reqwest::Client::new();

    let request_body = ChatRequest {
        model: model.unwrap_or_else(|| "openai/gpt-3.5-turbo".to_string()),
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: message,
        }],
    };

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        error!("OpenRouter API error: {} - {}", status, error_text);
        return Err(format!("API error: {} - {}", status, error_text));
    }

    let chat_response: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let assistant_message = chat_response
        .choices
        .first()
        .and_then(|choice| Some(choice.message.content.clone()))
        .unwrap_or_else(|| "No response from API".to_string());

    info!("Received response from OpenRouter");

    Ok(ChatResult {
        success: true,
        response: assistant_message,
    })
}

use base64::{engine::general_purpose, Engine as _};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct ContentPart {
    pub r#type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<ImageUrl>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageUrl {
    pub url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VisionMessage {
    pub role: String,
    pub content: Vec<ContentPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VisionRequest {
    pub model: String,
    pub messages: Vec<VisionMessage>,
}

#[command]
pub async fn chat_with_image(
    image_path: String,
    message: String,
    api_key: String,
    model: Option<String>,
) -> Result<ChatResult, String> {
    info!("Processing chat with image: {}", image_path);

    if api_key.is_empty() {
        return Err("API key is required. Please set your API key in settings.".to_string());
    }

    let image_bytes = fs::read(&image_path)
        .map_err(|e| format!("Failed to read image file: {}", e))?;
    let base64_image = general_purpose::STANDARD.encode(&image_bytes);
    let data_url = format!("data:image/png;base64,{}", base64_image);

    let client = reqwest::Client::new();

    let request_body = VisionRequest {
        model: model.unwrap_or_else(|| "openai/gpt-4o".to_string()),
        messages: vec![VisionMessage {
            role: "user".to_string(),
            content: vec![
                ContentPart {
                    r#type: "text".to_string(),
                    text: Some(message),
                    image_url: None,
                },
                ContentPart {
                    r#type: "image_url".to_string(),
                    text: None,
                    image_url: Some(ImageUrl { url: data_url }),
                },
            ],
        }],
    };

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        error!("OpenRouter API error: {} - {}", status, error_text);
        return Err(format!("API error: {} - {}", status, error_text));
    }

    let chat_response: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let assistant_message = chat_response
        .choices
        .first()
        .map(|choice| choice.message.content.clone())
        .unwrap_or_else(|| "No response from API".to_string());

    info!("Received vision response from OpenRouter");

    Ok(ChatResult {
        success: true,
        response: assistant_message,
    })
}
