const crud = require("./crudFactory");
const Task = require("../models/Task");
const Project = require("../models/Project");

module.exports = crud(Task, {
  fields: ["project", "title", "description", "status", "dueDate"],
  populate: { path: "project", select: "name" },

  // The project must belong to the logged-in business user
  validate: async (req, data) => {
    if (
      data.project &&
      !(await Project.exists({ _id: data.project, owner: req.user._id }))
    ) {
      return "Project not found";
    }
    return null;
  },
});
