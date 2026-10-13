const crud = require("./crudFactory");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const nextNumber = require("../utils/nextNumber");
const { streamDocumentPdf } = require("../utils/pdf");
const { validateDocument } = require("./documentHelpers");

const POPULATE = [
  { path: "client", select: "name company email phone address" },
  { path: "project", select: "name" },
];

const handlers = crud(Invoice, {
  fields: ["client", "project", "issueDate", "dueDate", "items", "notes"],
  populate: POPULATE,
  validate: validateDocument,
  beforeCreate: async (req) => ({
    number: await nextNumber(req.user._id, "invoice", "INV"),
  }),
  canUpdate: (invoice) =>
    ["paid", "cancelled"].includes(invoice.status)
      ? "Paid or cancelled invoices cannot be edited"
      : null,
  canDelete: async (invoice) =>
    (await Payment.exists({ invoice: invoice._id }))
      ? "Delete this invoice's payments first"
      : null,
});

const findOwned = (req) =>
  Invoice.findOne({ _id: req.params.id, owner: req.user._id });

// POST /:id/send  - draft -> sent. From now on the client can see it in their portal.
handlers.send = async (req, res) => {
  try {
    const invoice = await findOwned(req);
    if (!invoice) return res.status(404).json({ message: "Not found" });
    if (invoice.status !== "draft")
      return res
        .status(400)
        .json({ message: "Only draft invoices can be sent" });

    invoice.status = "sent";
    await invoice.save();
    await invoice.populate(POPULATE);
    res.json({ item: invoice });
  } catch (err) {
    crud.handleError(res, err);
  }
};

// POST /:id/cancel
handlers.cancel = async (req, res) => {
  try {
    const invoice = await findOwned(req);
    if (!invoice) return res.status(404).json({ message: "Not found" });
    if (["paid", "cancelled"].includes(invoice.status)) {
      return res
        .status(400)
        .json({ message: "This invoice is already paid or cancelled" });
    }
    if (invoice.amountPaid > 0) {
      return res
        .status(400)
        .json({ message: "This invoice has payments. Delete them first." });
    }

    invoice.status = "cancelled";
    await invoice.save();
    await invoice.populate(POPULATE);
    res.json({ item: invoice });
  } catch (err) {
    crud.handleError(res, err);
  }
};

// GET /:id/pdf  (add ?download=1 to force a download instead of opening in the browser)
handlers.pdf = async (req, res) => {
  try {
    const invoice = await findOwned(req).populate("client");
    if (!invoice) return res.status(404).json({ message: "Not found" });
    streamDocumentPdf(res, {
      type: "invoice",
      doc: invoice,
      business: req.user,
      download: req.query.download === "1",
    });
  } catch (err) {
    crud.handleError(res, err);
  }
};

module.exports = handlers;
