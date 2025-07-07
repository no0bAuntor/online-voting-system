const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Setting = require("../models/Setting");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Uploads will be stored in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Middleware to verify token and get user ID
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.id;
    next();
  });
}

// 1. Check if voting is open
router.get("/status", async (req, res) => {
  const setting = await Setting.findOne();
  res.json({ votingOpen: setting?.votingOpen ?? true });
});

// 2. Toggle voting status
router.post("/status", async (req, res) => {
  const { votingOpen } = req.body;
  let setting = await Setting.findOne();
  if (!setting) setting = new Setting({ votingOpen });
  setting.votingOpen = votingOpen;
  await setting.save();
  res.json({ message: "Voting status updated" });
});

// ✅ 3. Check if logged-in user has already voted
// GET /api/vote/voted
router.get("/voted", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ voted: user.voted });
});


// ✅ 4. Cast a vote 
router.post("/", auth, async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    // Validate candidate exists
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(req.userId);
    const setting = await Setting.findOne();

    if (!setting?.votingOpen) {
      return res.status(403).json({ message: "Voting is currently closed" });
    }

    if (user.voted) {
      return res.status(403).json({ 
        message: "You have already voted",
        timestamp: user.votedAt // Add this to your User model
      });
    }

    // Atomic operation to prevent race conditions
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId, voted: false }, // Only update if not voted
      { 
        voted: true, 
        votedAt: new Date(),
        candidateVoted: candidateId 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(403).json({ message: "Vote could not be processed" });
    }

    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });
    
    res.json({ 
      message: "Vote counted successfully",
      candidate: candidate.name,
      timestamp: updatedUser.votedAt
    });
  } catch (err) {
    console.error("Voting error:", err);
    res.status(500).json({ message: "Internal server error during voting" });
  }
});

// ✅ 5. Get candidate list (for voting page)
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// ✅ 6. Get all candidates (for admin)
router.get("/all", async (req, res) => {
  try {
    const candidates = await Candidate.find();
    
    // Get voter statistics
    const totalRegisteredUsers = await User.countDocuments({ isAdmin: false });
    const totalVotedUsers = await User.countDocuments({ voted: true, isAdmin: false });
    const votePercentage = totalRegisteredUsers > 0 ? ((totalVotedUsers / totalRegisteredUsers) * 100).toFixed(1) : 0;
    
    res.json({
      candidates,
      statistics: {
        totalRegisteredUsers,
        totalVotedUsers,
        votePercentage: parseFloat(votePercentage)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error getting candidates" });
  }
});

// ✅ 7. Add candidate (admin) with image upload
router.post("/add", upload.single("photo"), async (req, res) => {
  const { name, party } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : "";

  try {
    const candidate = new Candidate({ name, party, photoUrl });
    await candidate.save();
    res.json({ message: "Candidate added", candidate });
  } catch (err) {
    res.status(500).json({ message: "Error adding candidate" });
  }
});

// ✅ 8. Delete candidate (admin)
router.delete("/:id", async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting candidate" });
  }
});


module.exports = router;


// ✅ 9. Reset entire election (admin)
router.post("/reset", async (req, res) => {
  try {
    // 1. Remove all candidates
    await Candidate.deleteMany({});

    // 2. Reset all users' voted status
    await User.updateMany({}, { $set: { voted: false, candidateVoted: null, votedAt: null } });

    // 3. Close voting
    await Setting.updateOne({}, { votingOpen: false }, { upsert: true });

    res.json({ message: "Election reset successfully" });
  } catch (err) {
    console.error("Error resetting election:", err);
    res.status(500).json({ message: "Failed to reset election" });
  }
});




// ✅ 10. Get election statistics
router.get("/stats", async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalVotesCast = await User.countDocuments({ voted: true });
    const votingStatus = await Setting.findOne();

    res.json({
      totalCandidates,
      totalUsers,
      totalVotesCast,
      votingOpen: votingStatus?.votingOpen ?? true,
    });
  } catch (err) {
    console.error("Error fetching election stats:", err);
    res.status(500).json({ message: "Failed to fetch election statistics" });
  }
});


