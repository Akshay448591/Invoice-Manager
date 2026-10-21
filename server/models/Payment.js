const mongoose = require("mongoose");

const METHODS = ["bank_transfer", "upi", "cash", "card", "cheque", "other"];

const paymentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
    method: { type: String, enum: METHODS, default: "bank_transfer" },
    reference: { type: String, trim: true }, // UTR, cheque number...
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
