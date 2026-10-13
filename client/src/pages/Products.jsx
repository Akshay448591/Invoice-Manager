import ResourcePage from "../components/ResourcePage";
import { money, titleCase } from "../utils/format";

const fields = [
  { name: "name", label: "Name", required: true },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    default: "service",
    options: [
      { value: "service", label: "Service" },
      { value: "product", label: "Product" },
    ],
  },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "unitPrice",
    label: "Price per unit (₹)",
    type: "number",
    required: true,
  },
  {
    name: "unit",
    label: "Unit",
    default: "item",
    placeholder: "hour, day, piece…",
  },
  { name: "taxRate", label: "Tax rate (%)", type: "number", default: 0 },
  {
    name: "isActive",
    label: "Status",
    type: "checkbox",
    checkboxLabel: "Available for new invoices",
    default: true,
  },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type", render: (p) => titleCase(p.type) },
  {
    key: "unitPrice",
    label: "Price",
    render: (p) => `${money(p.unitPrice)} / ${p.unit || "item"}`,
  },
  { key: "taxRate", label: "Tax", render: (p) => `${p.taxRate ?? 0}%` },
  {
    key: "isActive",
    label: "Status",
    render: (p) => (p.isActive ? "Available" : "Hidden"),
  },
];

export default function Products() {
  return (
    <ResourcePage
      title="Products & services"
      subtitle="Reusable items you can add to invoices."
      singular="item"
      endpoint="/products"
      columns={columns}
      fields={fields}
      emptyText="No items yet. Add what you sell, like 'Website design, ₹5,000 per day'."
    />
  );
}
