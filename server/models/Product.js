const mongoose = require("mongoose");

// Reusable line item for invoices: a product you sell or a service you offer.
const productSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["service", "product"], default: "service" },
    unitPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "item" }, // hour, day, piece, month...
    taxRate: { type: Number, min: 0, max: 100, default: 0 }, // percent, e.g. 18 for 18% GST
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
