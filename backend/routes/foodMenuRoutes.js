const express = require("express");

const FoodMenu = require("../models/FoodMenu");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ================================
// ADD FOOD MENU
// ================================

router.post("/", protect, async (req, res) => {
  try {
    const foodMenu = new FoodMenu(req.body);

    const savedFoodMenu = await foodMenu.save();

    res.status(201).json(savedFoodMenu);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// GET FOOD MENUS
// ================================

router.get("/", protect, async (req, res) => {
  try {
    const foodMenus = await FoodMenu.find().sort({
      createdAt: -1,
    });

    res.json(foodMenus);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// UPDATE FOOD MENU
// ================================

router.put("/:id", protect, async (req, res) => {
  try {
    const updatedFoodMenu =
      await FoodMenu.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedFoodMenu) {
      return res.status(404).json({
        message: "Food menu not found",
      });
    }

    res.json(updatedFoodMenu);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ================================
// DELETE FOOD MENU
// ================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedFoodMenu =
      await FoodMenu.findByIdAndDelete(
        req.params.id
      );

    if (!deletedFoodMenu) {
      return res.status(404).json({
        message: "Food menu not found",
      });
    }

    res.json({
      message: "Food menu deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;