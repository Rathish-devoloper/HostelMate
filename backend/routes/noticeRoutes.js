const express = require("express");

const Notice = require("../models/Notice");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================================
// ADD NOTICE
// ================================

router.post("/", protect, async (req, res) => {
  try {
    const notice = new Notice(req.body);

    const savedNotice = await notice.save();

    res.status(201).json(savedNotice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// GET NOTICES
// ================================

router.get("/", protect, async (req, res) => {
  try {
    const notices = await Notice.find().sort({
      createdAt: -1,
    });

    res.json(notices);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// UPDATE NOTICE
// ================================

router.put("/:id", protect, async (req, res) => {
  try {
    const updatedNotice =
      await Notice.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedNotice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    res.json(updatedNotice);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// DELETE NOTICE
// ================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedNotice =
      await Notice.findByIdAndDelete(
        req.params.id
      );

    if (!deletedNotice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    res.json({
      message: "Notice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;