const Client = require("../models/Client");
const Invoice = require("../models/Invoice");
const Quote = require("../models/Quote");
const { streamDocumentPdf } = require("../utils/pdf");
const { handleError } = require("./crudFactory");

// Everything here is for logged-in CLIENTS and is limited to their own documents.
// Drafts are never shown.

const OWNER = { path: "owner", select: "name businessName email" }; // the business that sent it
const CLIENT = { path: "client", select: "name company email phone address" };

// Finds the Client record linked to the logged-in client user
exports.withClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ user: req.user._id });
    if (!client)
      return res
        .status(404)
        .json({ message: "No client profile found for this account" });
    req.clientProfile = client;
    next();
  } catch (err) {
    handleError(res, err);
  }
};

const visible = (req, extra = {}) => ({
  client: req.clientProfile._id,
  status: { $ne: "draft" },
  ...extra,
});

const lister = (Model) => async (req, res) => {
  try {
    const items = await Model.find(visible(req))
      .populate([OWNER, CLIENT])
      .sort({ issueDate: -1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    handleError(res, err);
  }
};

const getter = (Model) => async (req, res) => {
  try {
    const item = await Model.findOne(
      visible(req, { _id: req.params.id }),
    ).populate([OWNER, CLIENT]);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ item });
  } catch (err) {
    handleError(res, err);
  }
};

const pdfer = (Model, type) => async (req, res) => {
  try {
    const doc = await Model.findOne(
      visible(req, { _id: req.params.id }),
    ).populate([OWNER, CLIENT]);
    if (!doc) return res.status(404).json({ message: "Not found" });
    streamDocumentPdf(res, {
      type,
      doc,
      business: doc.owner,
      download: req.query.download === "1",
    });
  } catch (err) {
    handleError(res, err);
  }
};

exports.listInvoices = lister(Invoice);
exports.getInvoice = getter(Invoice);
exports.invoicePdf = pdfer(Invoice, "invoice");

exports.listQuotes = lister(Quote);
exports.getQuote = getter(Quote);
exports.quotePdf = pdfer(Quote, "quote");

// POST /quotes/:id/respond  { action: 'accept' | 'decline' }
exports.respondQuote = async (req, res) => {
  try {
    const { action } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be accept or decline" });
    }

    // Only a quote that is still "sent" can be answered, and only once
    const quote = await Quote.findOneAndUpdate(
      { _id: req.params.id, client: req.clientProfile._id, status: "sent" },
      {
        status: action === "accept" ? "accepted" : "declined",
        respondedAt: new Date(),
      },
      { new: true },
    ).populate([OWNER, CLIENT]);

    if (!quote)
      return res
        .status(400)
        .json({ message: "This quote can no longer be answered" });
    res.json({ item: quote });
  } catch (err) {
    handleError(res, err);
  }
};
