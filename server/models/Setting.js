const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  votingOpen: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Setting', settingSchema);
