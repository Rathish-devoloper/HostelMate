const express = require("express");

const Complaint = require("../models/Complaint");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================================
// ADD COMPLAINT
// ================================

router.post("/", protect, async (req, res) => {
  try {
    const complaint = new Complaint(req.body);

    const savedComplaint = await complaint.save();

    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// GET COMPLAINTS
// ================================

router.get("/", protect, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({
      createdAt: -1,
    });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// UPDATE COMPLAINT
// ================================

router.put("/:id", protect, async (req, res) => {
  try {
    const updatedComplaint =
      await Complaint.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedComplaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// DELETE COMPLAINT
// ================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedComplaint =
      await Complaint.findByIdAndDelete(
        req.params.id
      );

    if (!deletedComplaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;