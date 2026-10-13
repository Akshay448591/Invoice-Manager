import ResourcePage from "../components/ResourcePage";
import StatusBadge from "../components/StatusBadge";
import { fmtDate } from "../utils/format";

const fields = [
  { name: "title", label: "Task", required: true },
  {
    name: "project",
    label: "Project",
    type: "select",
    required: true,
    optionsFrom: { endpoint: "/projects", listKey: "items", labelKey: "name" },
  },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    default: "todo",
    options: [
      { value: "todo", label: "To do" },
      { value: "in_progress", label: "In progress" },
      { value: "done", label: "Done" },
    ],
  },
  { name: "dueDate", label: "Due date", type: "date" },
];

const columns = [
  { key: "title", label: "Task" },
  { key: "project", label: "Project", render: (t) => t.project?.name || "—" },
  {
    key: "status",
    label: "Status",
    render: (t) => <StatusBadge value={t.status} />,
  },
  { key: "dueDate", label: "Due", render: (t) => fmtDate(t.dueDate) },
];

export default function Tasks() {
  return (
    <ResourcePage
      title="Tasks"
      subtitle="Track the work inside each project."
      singular="task"
      endpoint="/tasks"
      columns={columns}
      fields={fields}
      emptyText="No tasks yet. Create a project first, then add its tasks."
    />
  );
}
