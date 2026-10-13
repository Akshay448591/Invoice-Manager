import { titleCase } from "../utils/format";

const GREY = ["bg-slate2/60", "text-slate2"];
const GREEN = ["bg-ok", "text-ok"];
const AMBER = ["bg-amber2", "text-amber2"];
const RED = ["bg-rose2", "text-rose2"];

const tones = {
  active: GREEN, completed: GREEN, done: GREEN, in_progress: AMBER, on_hold: AMBER, todo: GREY,
  draft: GREY, sent: AMBER, partial: AMBER, paid: GREEN, overdue: RED, cancelled: GREY,
  accepted: GREEN, declined: RED, converted: GREY,
};

// Dot + text status
export default function StatusBadge({ value }) {
  const [dot, text] = tones[value] || GREY;
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium ${text}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {titleCase(value)}
    </span>
  );
}
