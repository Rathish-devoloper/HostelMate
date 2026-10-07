import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage, fetchChatStatus } from "../../services/api";
import "./Chatbot.css";

const INITIAL_WELCOME_MESSAGE = {
  id: "welcome",
  sender: "ai",
  text: "Hi! I'm HostelMate AI 👋\nI can help you with rooms, complaints, notices, food menus, payments and using HostelMate.",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const SUGGESTIONS = [
  "How do I submit a complaint?",
  "How can I check my room?",
  "Where can I see notices?",
  "How do I check the food menu?",
  "What is the status of my complaint?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState({
    checked: false,
    online: false,
    modelInstalled: false,
    model: "llama3.2:3b",
  });

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Check Ollama health periodically / on mount
  const checkStatus = async () => {
    try {
      const data = await fetchChatStatus();
      setOllamaStatus({
        checked: true,
        online: Boolean(data.online),
        modelInstalled: Boolean(data.modelInstalled),
        model: data.configuredModel || "llama3.2:3b",
      });
    } catch {
      setOllamaStatus({
        checked: true,
        online: false,
        modelInstalled: false,
        model: "llama3.2:3b",
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // When opening chatbot, auto-focus input and scroll down
  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setTimeout(() => {
        textareaRef.current?.focus();
        scrollToBottom();
      }, 150);
    }
  }, [isOpen]);

  // Auto-scroll when messages or loading state changes
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, errorMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setErrorMessage("");
  };

  const handleClearConversation = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMessage("");
    setInputValue("");
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setErrorMessage("");
    const userMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update conversation state with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    // Prepare history payload (excluding welcome card)
    const historyPayload = updatedMessages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    try {
      const data = await sendChatMessage(query, historyPayload);

      const aiReplyText = data.reply || data.message || "I didn't receive a response.";
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setOllamaStatus((prev) => ({ ...prev, online: true }));
    } catch (error) {
      console.error("Chat error:", error);

      let fallbackError =
        "HostelMate AI is currently unavailable. Please make sure Ollama is running on your computer.";

      if (error.response?.data?.reply) {
        fallbackError = error.response.data.reply;
      } else if (error.response?.data?.error) {
        fallbackError = error.response.data.error;
      } else if (error.message?.includes("Network Error")) {
        fallbackError =
          "Cannot connect to the HostelMate backend. Please verify your server is running.";
      }

      setErrorMessage(fallbackError);

      // Append error notification bubble into the chat for clear user feedback
      const errorBubble = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        isError: true,
        text: fallbackError,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorBubble]);
      setOllamaStatus((prev) => ({ ...prev, online: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to format AI replies nicely (bold, bullets, line breaks)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");

    return lines.map((line, index) => {
      // Parse markdown-like bold (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={index} className="chat-bullet-line">
            <span className="chat-bullet">•</span>
            <span>{formattedLine}</span>
          </div>
        );
      }

      return (
        <span key={index}>
          {formattedLine}
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="hostelmate-chatbot-wrapper">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={handleToggle}
          title="Open HostelMate AI Chatbot"
          aria-label="Open HostelMate AI Chatbot"
        >
          <div className="fab-icon-glow"></div>
          <span className="fab-icon">💬</span>
          <span className="fab-label">HostelMate AI</span>
          <span
            className={`fab-status-dot ${
              ollamaStatus.online ? "status-online" : "status-idle"
            }`}
          ></span>
        </button>
      )}

      {/* Chat Window Modal / Panel */}
      {isOpen && (
        <div className="chatbot-panel" role="dialog" aria-labelledby="chatbot-title">
          {/* Header */}
          <header className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3 id="chatbot-title">HostelMate AI</h3>
                <div className="chatbot-status-row">
                  <span
                    className={`status-pill ${
                      ollamaStatus.online ? "online" : "offline"
                    }`}
                  >
                    <span className="status-indicator-dot"></span>
                    {ollamaStatus.online ? "Local AI (Offline Ready)" : "Local AI"}
                  </span>
                  <span className="model-badge" title="Model running in Ollama">
                    {ollamaStatus.model}
                  </span>
                </div>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={handleClearConversation}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                🗑️
              </button>
              <button
                className="chatbot-icon-btn close-btn"
                onClick={handleToggle}
                title="Minimize chatbot"
                aria-label="Close chatbot"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Messages Area */}
          <div className="chatbot-messages" tabIndex={0}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message-row ${
                  msg.sender === "user" ? "row-user" : "row-ai"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="message-avatar" aria-hidden="true">
                    🤖
                  </div>
                )}

                <div
                  className={`chat-bubble ${
                    msg.sender === "user" ? "bubble-user" : "bubble-ai"
                  } ${msg.isError ? "bubble-error" : ""}`}
                >
                  <div className="chat-bubble-text">
                    {renderFormattedText(msg.text)}
                  </div>
                  <div className="chat-bubble-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Quick Suggestions Chips */}
            {messages.length === 1 && !isLoading && (
              <div className="chatbot-suggestions">
                <span className="suggestions-title">💡 Suggested Questions:</span>
                <div className="suggestions-grid">
                  {SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-chip"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="chat-message-row row-ai">
                <div className="message-avatar" aria-hidden="true">
                  🤖
                </div>
                <div className="chat-bubble bubble-ai bubble-loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-caption">HostelMate AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick error banner if needed */}
          {errorMessage && !messages[messages.length - 1]?.isError && (
            <div className="chatbot-error-banner">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          {/* Input Footer */}
          <footer className="chatbot-footer">
            <div className="chatbot-input-container">
              <textarea
                ref={textareaRef}
                className="chatbot-textarea"
                rows={1}
                placeholder="Ask about rooms, complaints, food, notices..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                className="chatbot-send-btn"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                {isLoading ? (
                  <span className="send-spinner"></span>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            <div className="chatbot-footer-hint">
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for new line</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
