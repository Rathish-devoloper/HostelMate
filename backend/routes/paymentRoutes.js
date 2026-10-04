const express = require("express");

const Payment = require("../models/Payment");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================================
// ADD PAYMENT
// ================================

router.post("/", protect, async (req, res) => {
  try {
    const payment = new Payment(req.body);

    const savedPayment = await payment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// GET PAYMENTS
// ================================

router.get("/", protect, async (req, res) => {
  try {
    const payments = await Payment.find().sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// UPDATE PAYMENT
// ================================

router.put("/:id", protect, async (req, res) => {
  try {
    const updatedPayment =
      await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedPayment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// DELETE PAYMENT
// ================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedPayment =
      await Payment.findByIdAndDelete(
        req.params.id
      );

    if (!deletedPayment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json({
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;