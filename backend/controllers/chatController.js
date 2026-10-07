const User = require("../models/User");
const Student = require("../models/Student");
const Room = require("../models/Room");
const Complaint = require("../models/Complaint");
const Notice = require("../models/Notice");
const FoodMenu = require("../models/FoodMenu");
const Payment = require("../models/Payment");
const { sendChatRequest, checkOllamaHealth, OLLAMA_MODEL } = require("../services/ollamaService");

/**
 * Safely collect authenticated database context tailored to the user's role
 * NEVER exposes passwords, tokens, credentials, or other students' private data.
 */
const buildSafeHostelContext = async (userId, role) => {
  let contextLines = [];

  try {
    const user = await User.findById(userId).select("name email role");
    const userName = user ? user.name : "Hostel User";
    const userEmail = user ? user.email : "";

    contextLines.push(`USER PROFILE:`);
    contextLines.push(`- Logged-in Name: ${userName}`);
    contextLines.push(`- Role: ${role}`);

    if (role === "student") {
      // 1. Student details (their own room & phone)
      const studentRecord =
        (await Student.findOne({ email: userEmail }).select("name email phone roomNumber")) ||
        (await Student.findOne({
          name: { $regex: new RegExp(`^${userName}$`, "i") },
        }).select("name email phone roomNumber"));

      if (studentRecord) {
        contextLines.push(`- Assigned Room: ${studentRecord.roomNumber || "Not assigned yet"}`);
        contextLines.push(`- Registered Phone: ${studentRecord.phone || "Not recorded"}`);
      } else {
        contextLines.push(`- Assigned Room: Pending room assignment`);
      }

      // 2. Student's own complaints (NEVER show other students' complaints)
      const studentComplaints = await Complaint.find({
        studentName: { $regex: new RegExp(`^${userName}$`, "i") },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("complaint status createdAt");

      if (studentComplaints.length > 0) {
        contextLines.push(`\nSTUDENT'S SUBMITTED COMPLAINTS:`);
        studentComplaints.forEach((c, idx) => {
          contextLines.push(
            `  ${idx + 1}. Issue: "${c.complaint}" | Status: ${c.status} | Date: ${new Date(c.createdAt).toLocaleDateString()}`
          );
        });
      } else {
        contextLines.push(`\nSTUDENT'S SUBMITTED COMPLAINTS: No complaints submitted by you.`);
      }

      // 3. Student's own payments (NEVER show other students' payments)
      const studentPayments = await Payment.find({
        studentName: { $regex: new RegExp(`^${userName}$`, "i") },
      })
        .sort({ paymentDate: -1 })
        .limit(5)
        .select("amount paymentDate status");

      if (studentPayments.length > 0) {
        contextLines.push(`\nSTUDENT'S PAYMENT HISTORY:`);
        studentPayments.forEach((p, idx) => {
          contextLines.push(
            `  ${idx + 1}. Amount: ₹${p.amount} | Status: ${p.status} | Date: ${new Date(p.paymentDate).toLocaleDateString()}`
          );
        });
      } else {
        contextLines.push(`\nSTUDENT'S PAYMENT HISTORY: No payment records on file.`);
      }

      // 4. Room availability overview (safe public stats only)
      const totalRooms = await Room.countDocuments();
      const availableRooms = await Room.countDocuments({ status: "Available" });
      contextLines.push(`\nHOSTEL ROOM OVERVIEW:`);
      contextLines.push(`- Available Rooms: ${availableRooms} available (Total rooms: ${totalRooms})`);

    } else if (role === "admin") {
      // Admin context: System overview
      const [totalStudents, totalRooms, totalComplaints, pendingComplaints, totalPayments] =
        await Promise.all([
          Student.countDocuments(),
          Room.countDocuments(),
          Complaint.countDocuments(),
          Complaint.countDocuments({ status: "Pending" }),
          Payment.countDocuments(),
        ]);

      contextLines.push(`\nADMINISTRATIVE SYSTEM OVERVIEW:`);
      contextLines.push(`- Total Registered Students: ${totalStudents}`);
      contextLines.push(`- Total Rooms Configured: ${totalRooms}`);
      contextLines.push(
        `- Total Complaints: ${totalComplaints} (${pendingComplaints} Pending)`
      );
      contextLines.push(`- Total Payment Records: ${totalPayments}`);

      // Recent pending complaints for quick admin action
      const pendingList = await Complaint.find({ status: "Pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("studentName complaint status createdAt");

      if (pendingList.length > 0) {
        contextLines.push(`\nRECENT PENDING COMPLAINTS:`);
        pendingList.forEach((c, idx) => {
          contextLines.push(
            `  ${idx + 1}. From: ${c.studentName} | Issue: "${c.complaint}" | Date: ${new Date(c.createdAt).toLocaleDateString()}`
          );
        });
      }
    }

    // 5. Active Notices (accessible by both student and admin)
    const recentNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select("title message createdAt");

    if (recentNotices.length > 0) {
      contextLines.push(`\nACTIVE HOSTEL NOTICES:`);
      recentNotices.forEach((n, idx) => {
        contextLines.push(
          `  ${idx + 1}. [${n.title}] - "${n.message}" (${new Date(n.createdAt).toLocaleDateString()})`
        );
      });
    } else {
      contextLines.push(`\nACTIVE HOSTEL NOTICES: No active notices.`);
    }

    // 6. Food Menu (accessible by both student and admin)
    const menus = await FoodMenu.find().sort({ createdAt: 1 }).limit(7);
    if (menus.length > 0) {
      contextLines.push(`\nHOSTEL FOOD MENU:`);
      menus.forEach((m) => {
        contextLines.push(
          `  - ${m.day}: Breakfast: ${m.breakfast} | Lunch: ${m.lunch} | Dinner: ${m.dinner}`
        );
      });
    } else {
      contextLines.push(`\nHOSTEL FOOD MENU: Not configured yet.`);
    }
  } catch (error) {
    console.error("Warning: Failed to fetch database context for AI chat:", error.message);
    contextLines.push(`Note: Live database details could not be loaded at this moment.`);
  }

  return contextLines.join("\n");
};

/**
 * Handle incoming chat messages
 * POST /api/chat
 */
const handleChat = async (req, res) => {
  try {
    const { message, conversation } = req.body;

    // 1. Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required and cannot be empty.",
      });
    }

    const trimmedMessage = message.trim();
    const userId = req.user?.id;
    const userRole = req.user?.role || "student";

    // 2. Build safe database context
    const dbContext = await buildSafeHostelContext(userId, userRole);

    // 3. Construct system prompt
    const systemPrompt = `You are HostelMate AI, an intelligent assistant for the HostelMate hostel management system.
Help students and administrators with hostel-related questions such as rooms, complaints, notices, food menus, payments, hostel rules, and general navigation of the HostelMate application.
Give clear, concise, polite, and directly useful answers. Format answers cleanly using short paragraphs or bullet points where appropriate.

CRITICAL RULES:
1. Do not invent hostel-specific information (such as room numbers, payment sums, or complaints) that is not in the provided DATABASE CONTEXT.
2. If the user asks about specific information that is not available in the context below, state clearly that the record is not found or not yet assigned, and advise them to check with the hostel warden or administrator.
3. NEVER make up database records or pretend to have access to secrets, passwords, or credentials.
4. Respect the user's role. The current user is a "${userRole}".

HOW TO USE HOSTELMATE APPLICATION:
- Dashboard: Overview of hostel statistics (Students, Rooms, Complaints, Payments).
- Complaints: Students can enter their name and complaint description, then click "Submit Complaint". Admins can view complaints, update statuses (Pending/Resolved/In Progress), and delete complaints.
- Rooms: View hostel rooms with their capacity and status (Available/Occupied). Admins can add new rooms.
- Notices: View hostel announcements and emergency circulars. Admins can publish notices.
- Food Menu: Check the daily breakfast, lunch, and dinner timetable. Admins can update meal plans.
- Payments: Review payment records, fees, and receipts. Admins can record student payments.

COMMON HOSTEL RULES:
- Quiet hours: 10:00 PM to 6:00 AM.
- Cleanliness: Keep rooms and corridors tidy. Dispose of garbage in designated bins.
- Visitors: Allowed only during visiting hours in the common lounge after registering.
- Maintenance: Immediately report plumbing, electrical, or furniture damages via the Complaints section.

CURRENT DATABASE CONTEXT (ACCESSIBLE TO THIS USER):
${dbContext}
`;

    // 4. Build message sequence for Ollama
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Append prior conversation history if provided (limiting to last 6 messages)
    if (Array.isArray(conversation) && conversation.length > 0) {
      const sanitizedHistory = conversation
        .slice(-6)
        .map((entry) => {
          const role =
            entry.role === "user" || entry.sender === "user"
              ? "user"
              : "assistant";
          const content = entry.content || entry.text || "";
          return { role, content: content.trim() };
        })
        .filter((entry) => entry.content.length > 0);

      messages.push(...sanitizedHistory);
    }

    // Append the current user message
    messages.push({
      role: "user",
      content: trimmedMessage,
    });

    // 5. Query Ollama local AI runtime
    const aiResult = await sendChatRequest(messages);

    if (!aiResult.success) {
      // Graceful error response without crashing the server
      return res.status(503).json({
        success: false,
        reply: aiResult.error || "HostelMate AI is currently unavailable.",
        error: aiResult.error,
        errorType: aiResult.errorType,
        available: false,
      });
    }

    // 6. Return successful AI reply
    return res.status(200).json({
      success: true,
      reply: aiResult.content,
      message: aiResult.content, // for backwards-compatibility
      model: aiResult.model || OLLAMA_MODEL,
      available: true,
    });
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.status(500).json({
      success: false,
      reply: "An internal server error occurred while processing your chat request.",
      error: error.message,
      available: false,
    });
  }
};

/**
 * Check Ollama connectivity and model status
 * GET /api/chat/status
 */
const getChatStatus = async (req, res) => {
  try {
    const health = await checkOllamaHealth();
    return res.json({
      success: true,
      ...health,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      online: false,
      error: error.message,
    });
  }
};

module.exports = {
  handleChat,
  getChatStatus,
};
