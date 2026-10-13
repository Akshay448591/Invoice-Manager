import ResourcePage from "../components/ResourcePage";
import { fmtDate, money, titleCase, todayISO } from "../utils/format";

const fields = [
  {
    name: "invoice",
    label: "Invoice",
    type: "select",
    required: true,
    lockOnEdit: true, // a payment stays on the invoice it was recorded against
    optionsFrom: {
      endpoint: "/invoices",
      label: (inv) =>
        `${inv.number} · ${inv.client?.name || ""} · balance ${money(inv.balance)}`,
      // only invoices that can still take payments (plus the one this payment is already on)
      filter: (inv, payment) =>
        ["sent", "partial"].includes(inv.status) ||
        inv._id === (payment.invoice?._id || payment.invoice),
    },
  },
  { name: "amount", label: "Amount (₹)", type: "number", required: true },
  {
    name: "date",
    label: "Date received",
    type: "date",
    required: true,
    default: todayISO(),
  },
  {
    name: "method",
    label: "Method",
    type: "select",
    required: true,
    default: "bank_transfer",
    options: [
      { value: "bank_transfer", label: "Bank transfer" },
      { value: "upi", label: "UPI" },
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
      { value: "cheque", label: "Cheque" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "reference", label: "Reference (UTR, cheque no.)" },
  { name: "note", label: "Note", type: "textarea" },
];

const columns = [
  { key: "date", label: "Date", render: (p) => fmtDate(p.date) },
  { key: "invoice", label: "Invoice", render: (p) => p.invoice?.number || "—" },
  {
    key: "client",
    label: "Client",
    render: (p) => p.invoice?.client?.name || "—",
  },
  { key: "amount", label: "Amount", render: (p) => money(p.amount) },
  { key: "method", label: "Method", render: (p) => titleCase(p.method) },
  { key: "reference", label: "Reference" },
];

export default function Payments() {
  return (
    <ResourcePage
      title="Payments"
      subtitle="Record money received. The invoice moves to partial or paid automatically."
      singular="payment"
      endpoint="/payments"
      columns={columns}
      fields={fields}
      emptyText="No payments yet. Send an invoice, then record a payment when it arrives."
      nameOf={(p) => `this ${money(p.amount)} payment`}
      deleteNote="The invoice balance will go back up. This can't be undone."
    />
  );
}
