const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },

  capacity: {
    type: Number,
    required: true
  },

  occupied: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "Available"
  }
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;