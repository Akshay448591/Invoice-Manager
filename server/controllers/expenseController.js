const crud = require("./crudFactory");
const Expense = require("../models/Expense");

module.exports = crud(Expense, {
  fields: ["amount", "category", "date", "note"],
  sort: { date: -1 },
});
