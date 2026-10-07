const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { handleChat, getChatStatus } = require("../controllers/chatController");

// POST /api/chat - Send a chat query to HostelMate AI (protected)
router.post("/", protect, handleChat);

// GET /api/chat/status - Check local Ollama status & model availability (protected)
router.get("/status", protect, getChatStatus);

module.exports = router;
