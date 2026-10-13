import ResourcePage from "../components/ResourcePage";
import StatusBadge from "../components/StatusBadge";
import { fmtDate } from "../utils/format";

const fields = [
  { name: "name", label: "Project name", required: true },
  {
    name: "client",
    label: "Client",
    type: "select",
    required: true,
    optionsFrom: { endpoint: "/clients", listKey: "clients", labelKey: "name" },
  },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    default: "active",
    options: [
      { value: "active", label: "Active" },
      { value: "on_hold", label: "On hold" },
      { value: "completed", label: "Completed" },
    ],
  },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "dueDate", label: "Due date", type: "date" },
];

const columns = [
  { key: "name", label: "Project" },
  { key: "client", label: "Client", render: (p) => p.client?.name || "—" },
  {
    key: "status",
    label: "Status",
    render: (p) => <StatusBadge value={p.status} />,
  },
  { key: "dueDate", label: "Due", render: (p) => fmtDate(p.dueDate) },
];

export default function Projects() {
  return (
    <ResourcePage
      title="Projects"
      subtitle="Group the work you do for each client."
      singular="project"
      endpoint="/projects"
      columns={columns}
      fields={fields}
      emptyText="No projects yet. Add a client first, then create a project for them."
      deleteNote="All tasks in this project will be deleted too. This can't be undone."
    />
  );
}
