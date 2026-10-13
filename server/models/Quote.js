const mongoose = require("mongoose");
const { itemSchema, calcTotals } = require("./lineItems");

const quoteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    number: { type: String, required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    validUntil: { type: Date, required: true },
    items: {
      type: [itemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Add at least one line item",
      },
    },
    notes: { type: String, trim: true },

    // draft -> sent -> accepted | declined -> converted (into an invoice)
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "declined", "converted"],
      default: "draft",
    },
    respondedAt: Date,
    convertedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },

    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

quoteSchema.index({ owner: 1, number: 1 }, { unique: true });

quoteSchema.pre("validate", function (next) {
  Object.assign(this, calcTotals(this.items));
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
