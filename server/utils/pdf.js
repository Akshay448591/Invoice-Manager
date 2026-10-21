const PDFDocument = require("pdfkit");

const INK = "#12202B";
const MUTED = "#51606B";
const LINE = "#D8E0E5";
const BRAND = "#0E7C86";
const PAGE_BOTTOM = 740;

// The built-in PDF fonts have no rupee glyph, so amounts print as "Rs."
const money = (n) =>
  "Rs. " +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const date = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "-";

const titleCase = (s = "") =>
  s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// Table columns (x position, width)
const COLS = {
  desc: { x: 50, w: 200 },
  qty: { x: 255, w: 40 },
  price: { x: 300, w: 85 },
  tax: { x: 390, w: 40 },
  amount: { x: 435, w: 110 },
};

function tableHeader(pdf, y) {
  pdf.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
  pdf.text("DESCRIPTION", COLS.desc.x, y, { width: COLS.desc.w });
  pdf.text("QTY", COLS.qty.x, y, { width: COLS.qty.w, align: "right" });
  pdf.text("UNIT PRICE", COLS.price.x, y, {
    width: COLS.price.w,
    align: "right",
  });
  pdf.text("TAX", COLS.tax.x, y, { width: COLS.tax.w, align: "right" });
  pdf.text("AMOUNT", COLS.amount.x, y, {
    width: COLS.amount.w,
    align: "right",
  });
  pdf
    .moveTo(50, y + 15)
    .lineTo(545, y + 15)
    .strokeColor(LINE)
    .lineWidth(1)
    .stroke();
  return y + 24;
}

// Streams an invoice or quote PDF straight into the HTTP response.
//   type: 'invoice' | 'quote'
//   doc: the document with `client` populated
//   business: the business user (businessName, name, email)
exports.streamDocumentPdf = (res, { type, doc, business, download }) => {
  const isInvoice = type === "invoice";
  const d = doc.toJSON ? doc.toJSON() : doc;
  const biz = business && business.toJSON ? business.toJSON() : business || {};
  const client = d.client || {};
  const safeName = String(d.number || type).replace(/[^A-Za-z0-9-]/g, "");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${safeName}.pdf"`,
  );

  const pdf = new PDFDocument({ size: "A4", margin: 50 });
  pdf.pipe(res);

  // ---- Header
  pdf
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(INK)
    .text(biz.businessName || biz.name || "", 50, 50, { width: 280 });
  if (biz.email)
    pdf
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MUTED)
      .text(biz.email, 50, pdf.y + 2, { width: 280 });
  pdf
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(BRAND)
    .text(isInvoice ? "INVOICE" : "QUOTE", 345, 48, {
      width: 200,
      align: "right",
    });
  pdf
    .font("Helvetica")
    .fontSize(10)
    .fillColor(MUTED)
    .text(d.number || "", 345, 80, { width: 200, align: "right" });
  pdf.moveTo(50, 105).lineTo(545, 105).strokeColor(LINE).lineWidth(1).stroke();

  // ---- Bill to (left) and dates (right)
  let y = 125;
  pdf
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(MUTED)
    .text("BILL TO", 50, y);
  pdf
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(INK)
    .text(client.name || "", 50, y + 13, { width: 250 });
  pdf.font("Helvetica").fontSize(10).fillColor(MUTED);
  [client.company, client.email, client.phone, client.address]
    .filter(Boolean)
    .forEach((line) => pdf.text(line, 50, pdf.y + 1, { width: 250 }));
  const leftEnd = pdf.y;

  const status = isInvoice ? d.displayStatus || d.status : d.status;
  const meta = [
    ["Issue date", date(d.issueDate)],
    [
      isInvoice ? "Due date" : "Valid until",
      date(isInvoice ? d.dueDate : d.validUntil),
    ],
    ["Status", titleCase(status)],
  ];
  let metaY = y;
  meta.forEach(([k, v]) => {
    pdf
      .font("Helvetica")
      .fontSize(10)
      .fillColor(MUTED)
      .text(k, 345, metaY, { width: 90 });
    pdf
      .font("Helvetica-Bold")
      .fillColor(INK)
      .text(v, 435, metaY, { width: 110, align: "right" });
    metaY += 16;
  });
  y = Math.max(leftEnd, metaY) + 28;

  // ---- Line items
  y = tableHeader(pdf, y);
  (d.items || []).forEach((item) => {
    const net = item.quantity * item.unitPrice;
    pdf.font("Helvetica").fontSize(10);
    const h = Math.max(
      pdf.heightOfString(item.description, { width: COLS.desc.w }),
      12,
    );

    if (y + h + 10 > PAGE_BOTTOM) {
      pdf.addPage();
      y = tableHeader(pdf, 50);
    }

    pdf
      .font("Helvetica")
      .fillColor(INK)
      .fontSize(10)
      .text(item.description, COLS.desc.x, y, { width: COLS.desc.w });
    pdf.fontSize(9);
    pdf.text(String(item.quantity), COLS.qty.x, y, {
      width: COLS.qty.w,
      align: "right",
    });
    pdf.text(money(item.unitPrice), COLS.price.x, y, {
      width: COLS.price.w,
      align: "right",
    });
    pdf.text(`${item.taxRate || 0}%`, COLS.tax.x, y, {
      width: COLS.tax.w,
      align: "right",
    });
    pdf.text(money(net), COLS.amount.x, y, {
      width: COLS.amount.w,
      align: "right",
    });

    y += h + 8;
    pdf.moveTo(50, y).lineTo(545, y).strokeColor(LINE).lineWidth(0.5).stroke();
    y += 8;
  });

  // ---- Totals
  if (y + 120 > PAGE_BOTTOM) {
    pdf.addPage();
    y = 50;
  }
  y += 6;
  const row = (label, value, { bold = false, color = INK } = {}) => {
    pdf.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 10);
    pdf.fillColor(bold ? color : MUTED).text(label, 320, y, { width: 110 });
    pdf.fillColor(color).text(value, 435, y, { width: 110, align: "right" });
    y += bold ? 20 : 16;
  };
  row("Subtotal", money(d.subtotal));
  row("Tax", money(d.taxTotal));
  pdf.moveTo(320, y).lineTo(545, y).strokeColor(LINE).lineWidth(1).stroke();
  y += 8;
  row("Total", money(d.total), { bold: true });
  if (isInvoice) {
    row("Paid", money(d.amountPaid));
    row("Balance due", money((d.total || 0) - (d.amountPaid || 0)), {
      bold: true,
      color: BRAND,
    });
  }

  // ---- Notes
  if (d.notes) {
    y += 16;
    if (y + 60 > PAGE_BOTTOM) {
      pdf.addPage();
      y = 50;
    }
    pdf
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(MUTED)
      .text("NOTES", 50, y);
    pdf
      .font("Helvetica")
      .fontSize(10)
      .fillColor(INK)
      .text(d.notes, 50, y + 13, { width: 495 });
  }

  const { pdfGenerationDurationSeconds } = require("./metrics");
  const startTime = process.hrtime();
  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    pdfGenerationDurationSeconds.observe(
      { document_type: type },
      diff[0] + diff[1] / 1e9,
    );
  });

  pdf.end();
};
