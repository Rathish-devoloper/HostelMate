const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    paymentDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      default: "Paid"
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model(
  "Payment",
  paymentSchema
);

module.exports = Payment;