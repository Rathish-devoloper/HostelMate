require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Student = require("./models/Student");
const Room = require("./models/Room");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const foodMenuRoutes = require("./routes/foodMenuRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");

const protect = require("./middleware/authMiddleware");
const adminOnly = require("./middleware/adminMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });

app.get("/", (req, res) => {
  res.send("HostelMate Backend is running 🚀");
});

app.get("/protected-test", protect, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

app.use("/auth", authRoutes);

// =========================
// STUDENTS
// =========================

// GET students
// Admin and Student can view students
app.get("/students", protect, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD student
// Admin only
app.post("/students", protect, adminOnly, async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE student
// Admin only
app.put("/students/:id", protect, adminOnly, async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE student
// Admin only
app.delete(
  "/students/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const deletedStudent =
        await Student.findByIdAndDelete(req.params.id);

      if (!deletedStudent) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      res.json({
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

// =========================
// ROOMS
// =========================

app.post("/rooms", protect, async (req, res) => {
  try {
    const room = new Room(req.body);
    const savedRoom = await room.save();

    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/rooms", protect, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// OTHER ROUTES
// =========================

app.use("/complaints", complaintRoutes);
app.use("/notices", noticeRoutes);
app.use("/food-menu", foodMenuRoutes);
app.use("/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});