import ResourcePage from "../components/ResourcePage";
import { fmtDate, money, titleCase, todayISO } from "../utils/format";

const fields = [
  { name: "amount", label: "Amount (₹)", type: "number", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    default: "other",
    options: [
      { value: "software", label: "Software" },
      { value: "travel", label: "Travel" },
      { value: "office", label: "Office" },
      { value: "marketing", label: "Marketing" },
      { value: "utilities", label: "Utilities" },
      { value: "professional_fees", label: "Professional fees" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
    default: todayISO(),
  },
  { name: "note", label: "Note", type: "textarea" },
];

const columns = [
  { key: "date", label: "Date", render: (e) => fmtDate(e.date) },
  { key: "category", label: "Category", render: (e) => titleCase(e.category) },
  { key: "amount", label: "Amount", render: (e) => money(e.amount) },
  { key: "note", label: "Note" },
];

export default function Expenses() {
  return (
    <ResourcePage
      title="Expenses"
      subtitle="Money you spent running your business."
      singular="expense"
      endpoint="/expenses"
      columns={columns}
      fields={fields}
      emptyText="No expenses yet. Add one to start tracking your spending."
      nameOf={(e) => `this ${titleCase(e.category).toLowerCase()} expense`}
    />
  );
}
