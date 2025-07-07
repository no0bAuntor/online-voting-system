const express = require("express");
const multer = require("multer");
const path = require("path");
const Symbol = require("../models/Symbol");

const router = express.Router();

// Multer storage configuration for symbols
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/symbols/"); // Symbols will be stored in the 'uploads/symbols' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET /api/symbols - Get all symbols
router.get("/", async (req, res) => {
  try {
    const symbols = await Symbol.find().sort({ createdAt: -1 });
    res.json(symbols);
  } catch (err) {
    console.error("Error fetching symbols:", err);
    res.status(500).json({ error: "Failed to fetch symbols" });
  }
});

// POST /api/symbols - Add a new symbol
router.post("/", upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Symbol name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Symbol image is required" });
    }

    // Check if symbol with this name already exists
    const existingSymbol = await Symbol.findOne({ name: name.trim() });
    if (existingSymbol) {
      return res.status(400).json({ error: "Symbol with this name already exists" });
    }

    const symbolData = {
      name: name.trim(),
      imageUrl: `/uploads/symbols/${req.file.filename}`,
      description: description ? description.trim() : ""
    };

    const symbol = new Symbol(symbolData);
    await symbol.save();
    
    res.status(201).json({ 
      message: "Symbol added successfully", 
      symbol 
    });
  } catch (err) {
    console.error("Error adding symbol:", err);
    res.status(500).json({ error: "Failed to add symbol" });
  }
});

// DELETE /api/symbols/:id - Delete a symbol
router.delete("/:id", async (req, res) => {
  try {
    const symbol = await Symbol.findById(req.params.id);
    if (!symbol) {
      return res.status(404).json({ error: "Symbol not found" });
    }

    await Symbol.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: "Symbol deleted successfully",
      deletedSymbol: symbol.name
    });
  } catch (err) {
    console.error("Error deleting symbol:", err);
    res.status(500).json({ error: "Failed to delete symbol" });
  }
});

// PUT /api/symbols/:id - Update a symbol
router.put("/:id", upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const symbol = await Symbol.findById(req.params.id);
    
    if (!symbol) {
      return res.status(404).json({ error: "Symbol not found" });
    }

    if (name && name.trim() !== symbol.name) {
      // Check if another symbol with this name exists
      const existingSymbol = await Symbol.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingSymbol) {
        return res.status(400).json({ error: "Symbol with this name already exists" });
      }
      symbol.name = name.trim();
    }

    if (description !== undefined) {
      symbol.description = description.trim();
    }

    if (req.file) {
      symbol.imageUrl = `/uploads/symbols/${req.file.filename}`;
    }

    await symbol.save();
    
    res.json({ 
      message: "Symbol updated successfully", 
      symbol 
    });
  } catch (err) {
    console.error("Error updating symbol:", err);
    res.status(500).json({ error: "Failed to update symbol" });
  }
});

module.exports = router;

