const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();

const clientUrl = process.env.CLIENT_URL;
const corsOptions = {
  origin: clientUrl ? clientUrl.split(",").map((s) => s.trim()) : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
const resourceRouter = require("./routes/resourceRouter");
app.use(
  "/api/products",
  resourceRouter(require("./controllers/productController")),
);
app.use(
  "/api/projects",
  resourceRouter(require("./controllers/projectController")),
);
app.use("/api/tasks", resourceRouter(require("./controllers/taskController")));
app.use(
  "/api/expenses",
  resourceRouter(require("./controllers/expenseController")),
);
app.use("/api/quotes", require("./routes/quoteRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use(
  "/api/payments",
  resourceRouter(require("./controllers/paymentController")),
);
app.use("/api/portal", require("./routes/portalRoutes")); // client portal

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDB().then(() =>
    app.listen(PORT, () => console.log(`API running on :${PORT}`)),
  );
}

module.exports = app;

