export const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Dates from the API are stored as UTC midnight, so show them in UTC
// to avoid the day shifting in some time zones.
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

export const titleCase = (s = "") =>
  s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

// Local-time "YYYY-MM-DD" for <input type="date"> defaults
const localISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayISO = () => localISO(new Date());

export const inDaysISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return localISO(d);
};
