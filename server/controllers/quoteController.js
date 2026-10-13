const crud = require("./crudFactory");
const Quote = require("../models/Quote");
const Invoice = require("../models/Invoice");
const nextNumber = require("../utils/nextNumber");
const { streamDocumentPdf } = require("../utils/pdf");
const { validateDocument } = require("./documentHelpers");

const POPULATE = [
  { path: "client", select: "name company email phone address" },
  { path: "project", select: "name" },
];

const handlers = crud(Quote, {
  fields: ["client", "project", "issueDate", "validUntil", "items", "notes"],
  populate: POPULATE,
  validate: validateDocument,
  beforeCreate: async (req) => ({
    number: await nextNumber(req.user._id, "quote", "QUO"),
  }),
  canUpdate: (quote) =>
    ["draft", "sent"].includes(quote.status)
      ? null
      : "Only draft or sent quotes can be edited",
  canDelete: (quote) =>
    quote.status === "converted" ? "Converted quotes cannot be deleted" : null,
});

const owned = (req) => ({ _id: req.params.id, owner: req.user._id });

// POST /:id/send  - draft -> sent. The client can now accept or decline it in their portal.
handlers.send = async (req, res) => {
  try {
    const quote = await Quote.findOne(owned(req));
    if (!quote) return res.status(404).json({ message: "Not found" });
    if (quote.status !== "draft")
      return res.status(400).json({ message: "Only draft quotes can be sent" });

    quote.status = "sent";
    await quote.save();
    await quote.populate(POPULATE);
    res.json({ item: quote });
  } catch (err) {
    crud.handleError(res, err);
  }
};

// POST /:id/convert  - accepted quote -> new draft invoice (one click)
handlers.convert = async (req, res) => {
  try {
    // Claim the quote atomically so a double-click can't create two invoices
    const quote = await Quote.findOneAndUpdate(
      { ...owned(req), status: "accepted" },
      { status: "converted" },
    );
    if (!quote)
      return res
        .status(400)
        .json({ message: "Only accepted quotes can be converted" });

    let invoice;
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (Number(req.body?.dueInDays) || 14));

      invoice = await Invoice.create({
        owner: req.user._id,
        client: quote.client,
        project: quote.project,
        quote: quote._id,
        number: await nextNumber(req.user._id, "invoice", "INV"),
        issueDate: new Date(),
        dueDate,
        items: quote.items.map((i) => i.toObject()),
        notes: quote.notes,
      });
    } catch (err) {
      await Quote.updateOne({ _id: quote._id }, { status: "accepted" }); // undo the claim
      throw err;
    }

    await Quote.updateOne(
      { _id: quote._id },
      { convertedInvoice: invoice._id },
    );
    res.status(201).json({ item: invoice });
  } catch (err) {
    crud.handleError(res, err);
  }
};

// GET /:id/pdf
handlers.pdf = async (req, res) => {
  try {
    const quote = await Quote.findOne(owned(req)).populate("client");
    if (!quote) return res.status(404).json({ message: "Not found" });
    streamDocumentPdf(res, {
      type: "quote",
      doc: quote,
      business: req.user,
      download: req.query.download === "1",
    });
  } catch (err) {
    crud.handleError(res, err);
  }
};

module.exports = handlers;
