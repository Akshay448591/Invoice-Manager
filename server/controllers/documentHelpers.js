const Client = require("../models/Client");
const Project = require("../models/Project");
const Product = require("../models/Product");

// Shared validation for invoices and quotes. Runs before anything is saved,
// cleans up the line items, and makes sure every referenced record belongs
// to the logged-in business user.
exports.validateDocument = async (req, data) => {
  const creating = req.method === "POST";
  const owner = req.user._id;

  if (creating && !data.client) return "Client is required";
  if (data.client && !(await Client.exists({ _id: data.client, owner })))
    return "Client not found";

  if (data.project) {
    const filter = { _id: data.project, owner };
    if (data.client) filter.client = data.client;
    if (!(await Project.exists(filter)))
      return "Project not found for this client";
  }

  if (creating && data.items === undefined) return "Add at least one line item";

  if (data.items !== undefined) {
    if (!Array.isArray(data.items) || data.items.length === 0)
      return "Add at least one line item";

    const items = [];
    for (const raw of data.items) {
      const description = String(raw.description || "").trim();
      const quantity = Number(raw.quantity);
      const unitPrice = Number(raw.unitPrice);
      const taxRate = Number(raw.taxRate || 0);

      if (!description) return "Every line item needs a description";
      if (!(quantity > 0)) return "Quantity must be greater than 0";
      if (!(unitPrice >= 0)) return "Price must be 0 or more";
      if (!(taxRate >= 0 && taxRate <= 100))
        return "Tax rate must be between 0 and 100";

      items.push({
        product: raw.product || undefined,
        description,
        quantity,
        unitPrice,
        taxRate,
      });
    }

    const productIds = [
      ...new Set(items.filter((i) => i.product).map((i) => String(i.product))),
    ];
    if (
      productIds.length &&
      (await Product.countDocuments({ _id: { $in: productIds }, owner })) !==
        productIds.length
    ) {
      return "One of the selected products was not found";
    }

    data.items = items;
  }

  return null;
};
