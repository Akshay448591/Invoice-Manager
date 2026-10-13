const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/invoiceController");

router.use(protect, requireRole("business"));

router.route("/").get(c.list).post(c.create);
router.get("/:id/pdf", c.pdf);
router.post("/:id/send", c.send);
router.post("/:id/cancel", c.cancel);
router.route("/:id").get(c.get).put(c.update).delete(c.remove);

module.exports = router;
