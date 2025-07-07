// Load environment variables from .env
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function updateUsers() {
  await mongoose.connect(MONGO_URI);
  const result = await User.updateMany(
    { $or: [{ voted: { $exists: false } }, { voted: null }] },
    { $set: { voted: false } }
  );
  console.log(`Updated ${result.nModified || result.modifiedCount} users.`);
  await mongoose.disconnect();
}

updateUsers().catch(err => {
  console.error('Error updating users:', err);
  process.exit(1);
});
