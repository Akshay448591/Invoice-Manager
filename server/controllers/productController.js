const crud = require("./crudFactory");
const Product = require("../models/Product");

module.exports = crud(Product, {
  fields: [
    "name",
    "description",
    "type",
    "unitPrice",
    "unit",
    "taxRate",
    "isActive",
  ],
  sort: { name: 1 },
});
