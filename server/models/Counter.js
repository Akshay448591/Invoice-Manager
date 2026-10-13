const mongoose = require("mongoose");

// One counter per business user per document type, so every user gets
// their own INV-0001, INV-0002... and QUO-0001, QUO-0002... sequences.
const counterSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  key: { type: String, required: true }, // 'invoice' | 'quote'
  seq: { type: Number, default: 0 },
});

counterSchema.index({ owner: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Counter", counterSchema);
