const mongoose = require("mongoose");

// Shared by invoices and quotes. Description and price are copied onto the
// document (a snapshot), so changing a product later never alters old invoices.
const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // optional link
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 }, // percent
  },
  { _id: false },
);

const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const calcTotals = (items = []) => {
  let subtotal = 0;
  let taxTotal = 0;
  items.forEach((i) => {
    const net = i.quantity * i.unitPrice;
    subtotal += net;
    taxTotal += (net * (i.taxRate || 0)) / 100;
  });
  subtotal = round(subtotal);
  taxTotal = round(taxTotal);
  return { subtotal, taxTotal, total: round(subtotal + taxTotal) };
};

module.exports = { itemSchema, calcTotals, round };
