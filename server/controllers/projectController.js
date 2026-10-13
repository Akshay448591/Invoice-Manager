const crud = require("./crudFactory");
const Project = require("../models/Project");
const Client = require("../models/Client");
const Task = require("../models/Task");

module.exports = crud(Project, {
  fields: ["client", "name", "description", "status", "startDate", "dueDate"],
  populate: { path: "client", select: "name company" },

  // The client must belong to the logged-in business user
  validate: async (req, data) => {
    if (
      data.client &&
      !(await Client.exists({ _id: data.client, owner: req.user._id }))
    ) {
      return "Client not found";
    }
    return null;
  },

  // Deleting a project also deletes its tasks
  onDelete: (project) => Task.deleteMany({ project: project._id }),
});
