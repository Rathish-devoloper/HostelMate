/**
 * Ollama AI Service
 * Handles offline communication with the local Ollama API
 */

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds timeout for local inference

/**
 * Check if the local Ollama instance is accessible and list models
 */
const checkOllamaHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        online: false,
        error: `Ollama returned HTTP status ${response.status}`,
        models: [],
      };
    }

    const data = await response.json();
    const models = (data.models || []).map((m) => m.name);
    const hasConfiguredModel = models.some(
      (name) =>
        name === OLLAMA_MODEL ||
        name.startsWith(`${OLLAMA_MODEL}:`) ||
        `${name}:latest` === OLLAMA_MODEL
    );

    return {
      online: true,
      models,
      configuredModel: OLLAMA_MODEL,
      modelInstalled: hasConfiguredModel,
    };
  } catch (error) {
    return {
      online: false,
      error: error.message || "Failed to connect to Ollama",
      models: [],
      configuredModel: OLLAMA_MODEL,
      modelInstalled: false,
    };
  }
};

/**
 * Send a chat request to Ollama
 * @param {Array<{ role: string, content: string }>} messages
 * @param {string} [customModel]
 * @returns {Promise<{ success: boolean, content?: string, error?: string, errorType?: string }>}
 */
const sendChatRequest = async (messages, customModel = null) => {
  const modelToUse = customModel || OLLAMA_MODEL;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          errorType: "MODEL_NOT_FOUND",
          error: `The local model "${modelToUse}" is not installed in Ollama. Please run: ollama pull ${modelToUse}`,
        };
      }

      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        errorType: "OLLAMA_ERROR",
        error: `Ollama error (${response.status}): ${errorText || response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.message && data.message.content) {
      return {
        success: true,
        content: data.message.content.trim(),
        model: modelToUse,
      };
    }

    return {
      success: false,
      errorType: "EMPTY_RESPONSE",
      error: "Ollama returned an empty response.",
    };
  } catch (error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return {
        success: false,
        errorType: "TIMEOUT",
        error:
          "HostelMate AI took too long to respond. Your computer may be under high load. Please try again in a moment.",
      };
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.cause?.code === "ECONNREFUSED" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("ECONNREFUSED")
    ) {
      return {
        success: false,
        errorType: "OLLAMA_UNAVAILABLE",
        error:
          "HostelMate AI is currently unavailable. Please make sure Ollama is running on your computer.",
      };
    }

    return {
      success: false,
      errorType: "SERVER_ERROR",
      error: error.message || "Failed to communicate with the local AI runtime.",
    };
  }
};

module.exports = {
  OLLAMA_URL,
  OLLAMA_MODEL,
  checkOllamaHealth,
  sendChatRequest,
};
