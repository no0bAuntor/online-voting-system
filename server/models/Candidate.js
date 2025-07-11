const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  party: String,
  photoUrl: {
    type: String,
    default: ""
  },
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Candidate", candidateSchema);
