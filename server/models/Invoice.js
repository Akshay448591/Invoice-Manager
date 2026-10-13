const mongoose = require("mongoose");
const { itemSchema, calcTotals, round } = require("./lineItems");

const invoiceSchema = new mongoose.Schema(
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
    quote: { type: mongoose.Schema.Types.ObjectId, ref: "Quote" }, // set when created from a quote
    number: { type: String, required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    items: {
      type: [itemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "Add at least one line item",
      },
    },
    notes: { type: String, trim: true },

    // draft -> sent -> partial -> paid. "overdue" is worked out when reading (see displayStatus).
    status: {
      type: String,
      enum: ["draft", "sent", "partial", "paid", "cancelled"],
      default: "draft",
    },

    // Calculated on save. Never trust totals sent from the browser.
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 }, // kept in sync with the Payment records
  },
  { timestamps: true, toJSON: { virtuals: true } },
);

invoiceSchema.index({ owner: 1, number: 1 }, { unique: true });

invoiceSchema.pre("validate", function (next) {
  Object.assign(this, calcTotals(this.items));

  // Payments move the status; drafts and cancelled invoices stay as they are.
  if (!["draft", "cancelled"].includes(this.status)) {
    if (this.total > 0 && this.amountPaid >= this.total) this.status = "paid";
    else if (this.amountPaid > 0) this.status = "partial";
    else this.status = "sent";
  }
  next();
});

invoiceSchema.virtual("balance").get(function () {
  return round(this.total - this.amountPaid);
});

// What the UI shows: same as status, except unpaid invoices past their due date.
invoiceSchema.virtual("displayStatus").get(function () {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (
    ["sent", "partial"].includes(this.status) &&
    this.dueDate &&
    this.dueDate < today
  )
    return "overdue";
  return this.status;
});

module.exports = mongoose.model("Invoice", invoiceSchema);
