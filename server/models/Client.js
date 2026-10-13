const mongoose = require('mongoose');

// A client record belongs to one business user (owner)
// and is linked to the User account the client logs in with.
const clientSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
