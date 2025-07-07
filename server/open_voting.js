// Script to set votingOpen=true in the Setting collection
require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('./models/Setting');

const MONGO_URI = process.env.MONGO_URI;

async function openVoting() {
  await mongoose.connect(MONGO_URI);
  let setting = await Setting.findOne();
  if (!setting) {
    setting = new Setting({ votingOpen: true });
  } else {
    setting.votingOpen = true;
  }
  await setting.save();
  console.log('Voting is now OPEN.');
  await mongoose.disconnect();
}

openVoting().catch(err => {
  console.error('Error opening voting:', err);
  process.exit(1);
});
