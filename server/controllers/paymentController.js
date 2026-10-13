const crud = require("./crudFactory");
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const { round } = require("../models/lineItems");

// Re-adds up every payment on an invoice and saves the result on it.
// Saving the invoice also moves its status: sent -> partial -> paid (and back).
const syncInvoice = async (invoiceId) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) return;
  const payments = await Payment.find({ invoice: invoiceId });
  invoice.amountPaid = round(payments.reduce((sum, p) => sum + p.amount, 0));
  await invoice.save();
};

module.exports = crud(Payment, {
  fields: ["invoice", "amount", "date", "method", "reference", "note"],
  sort: { date: -1, createdAt: -1 },
  populate: {
    path: "invoice",
    select: "number total client",
    populate: { path: "client", select: "name" },
  },

  validate: async (req, data) => {
    const creating = req.method === "POST";
    let existing = null;

    if (!creating) {
      existing = await Payment.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      delete data.invoice; // a payment can't be moved to another invoice
    }

    const invoiceId = creating ? data.invoice : existing && existing.invoice;
    if (!invoiceId) return "Invoice is required";

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      owner: req.user._id,
    });
    if (!invoice) return "Invoice not found";
    if (["draft", "cancelled"].includes(invoice.status)) {
      return "Payments can only be recorded on sent invoices";
    }

    if (data.amount !== undefined) {
      const amount = Number(data.amount);
      if (!(amount > 0)) return "Amount must be greater than 0";
      const allowed = round(
        invoice.total - invoice.amountPaid + (existing ? existing.amount : 0),
      );
      if (amount > allowed + 0.001)
        return `Amount is more than the balance due (${allowed})`;
    }
    return null;
  },

  afterSave: (payment) => syncInvoice(payment.invoice),
  onDelete: (payment) => syncInvoice(payment.invoice),
});
