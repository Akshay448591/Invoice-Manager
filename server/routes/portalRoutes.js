const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const c = require("../controllers/portalController");

// Client portal API: only logged-in clients
router.use(protect, requireRole("client"), c.withClient);

router.get("/invoices", c.listInvoices);
router.get("/invoices/:id", c.getInvoice);
router.get("/invoices/:id/pdf", c.invoicePdf);

router.get("/quotes", c.listQuotes);
router.get("/quotes/:id", c.getQuote);
router.get("/quotes/:id/pdf", c.quotePdf);
router.post("/quotes/:id/respond", c.respondQuote);

module.exports = router;
