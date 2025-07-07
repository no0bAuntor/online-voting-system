const express = require('express');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const results = await Candidate.find().sort({ votes: -1 });
    
    // Get voter statistics
    const totalRegisteredUsers = await User.countDocuments({ isAdmin: false });
    const totalVotedUsers = await User.countDocuments({ voted: true, isAdmin: false });
    const votePercentage = totalRegisteredUsers > 0 ? ((totalVotedUsers / totalRegisteredUsers) * 100).toFixed(1) : 0;
    
    res.json({
      candidates: results,
      statistics: {
        totalRegisteredUsers,
        totalVotedUsers,
        votePercentage: parseFloat(votePercentage)
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
});

module.exports = router;
