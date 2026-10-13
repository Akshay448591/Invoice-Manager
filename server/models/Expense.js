const mongoose = require("mongoose");

const CATEGORIES = [
  "software",
  "travel",
  "office",
  "marketing",
  "utilities",
  "professional_fees",
  "other",
];

const expenseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: CATEGORIES,
      default: "other",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
