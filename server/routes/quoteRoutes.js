const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/quoteController");

router.use(protect, requireRole("business"));

router.route("/").get(c.list).post(c.create);
router.get("/:id/pdf", c.pdf);
router.post("/:id/send", c.send);
router.post("/:id/convert", c.convert);
router.route("/:id").get(c.get).put(c.update).delete(c.remove);

module.exports = router;
