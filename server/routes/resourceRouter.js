const express = require("express");
const { protect, requireRole } = require("../middleware/auth");

// Turns a CRUD controller into a router that only business users can use.
module.exports = (controller) => {
  const router = express.Router();
  router.use(protect, requireRole("business"));
  router.route("/").get(controller.list).post(controller.create);
  router
    .route("/:id")
    .get(controller.get)
    .put(controller.update)
    .delete(controller.remove);
  return router;
};
