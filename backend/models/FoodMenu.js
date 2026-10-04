const mongoose = require("mongoose");

const foodMenuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true
    },

    breakfast: {
      type: String,
      required: true
    },

    lunch: {
      type: String,
      required: true
    },

    dinner: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const FoodMenu = mongoose.model(
  "FoodMenu",
  foodMenuSchema
);

module.exports = FoodMenu;