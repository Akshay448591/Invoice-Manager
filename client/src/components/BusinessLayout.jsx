import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/clients", label: "Clients", icon: "clients" },
  { to: "/projects", label: "Projects", icon: "projects" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/quotes", label: "Quotes", icon: "quotes" },
  { to: "/invoices", label: "Invoices", icon: "invoices" },
  { to: "/payments", label: "Payments", icon: "payments" },
  { to: "/products", label: "Products", icon: "products" },
  { to: "/expenses", label: "Expenses", icon: "expenses" },
];

// Full sidebar (icon + name) on desktop, bottom bar on mobile
export default function BusinessLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("You have been logged out");
      navigate("/login");
    } catch {
      toast.error("Could not log out. Try again.");
    }
  };

  const item =
    "flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium transition md:w-full md:flex-row md:gap-3 md:px-4 md:py-3 md:text-sm";

  return (
    <div className="min-h-screen md:flex">
      <aside className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-1 overflow-x-auto bg-brand px-2 py-1 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col md:items-stretch md:overflow-y-auto md:px-4 md:py-7">
        <div className="mb-8 hidden items-center gap-3 px-2 md:flex">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 text-lg font-semibold text-white">I</span>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight text-white">Invoice Manager</p>
            <p className="mt-0.5 truncate text-xs text-white/65">{user.businessName || user.name}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 md:flex-col md:items-stretch md:gap-1.5" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${item} ${isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`
              }
            >
              <Icon name={l.icon} className="h-5 w-5 shrink-0" />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout} className={`${item} text-white/70 hover:bg-white/10 hover:text-white md:mt-auto`}>
          <Icon name="logout" className="h-5 w-5 shrink-0" />
          <span>Log out</span>
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-5 pb-28 pt-8 md:px-10 md:pb-14 md:pt-10">
        <div key={location.pathname.split("/")[1]} className="anim-fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
