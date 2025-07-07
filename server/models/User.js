const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  voted: { type: Boolean, default: false }, // Track if user has voted
  votedAt: { type: Date }, // When the user voted
  candidateVoted: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' } // Who the user voted for
});

module.exports = mongoose.model('User', UserSchema);