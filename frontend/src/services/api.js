import axios from "axios";

export const API_BASE_URL = "https://hostelmate-pvmf.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Send a chat message to the HostelMate AI backend
 * @param {string} message - User query
 * @param {Array} conversation - Prior chat history
 * @returns {Promise<Object>}
 */
export const sendChatMessage = async (message, conversation = []) => {
  const response = await api.post("/api/chat", {
    message,
    conversation,
  });
  return response.data;
};

/**
 * Check the status of the local Ollama backend service
 * @returns {Promise<Object>}
 */
export const fetchChatStatus = async () => {
  const response = await api.get("/api/chat/status");
  return response.data;
};

export default api;
