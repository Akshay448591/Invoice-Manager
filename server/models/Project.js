const mongoose = require("mongoose");

// Groups work for one client.
const projectSchema = new mongoose.Schema(
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
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "on_hold", "completed"],
      default: "active",
    },
    startDate: Date,
    dueDate: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
