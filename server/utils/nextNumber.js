const Counter = require("../models/Counter");

// nextNumber(userId, 'invoice', 'INV') -> "INV-0001", then "INV-0002"...
// The increment is atomic, so two requests can never get the same number.
module.exports = async (owner, key, prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { owner, key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return `${prefix}-${String(counter.seq).padStart(4, "0")}`;
};
