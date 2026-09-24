import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Layers,
  Utensils,
  UtensilsCrossed,
  UserRound,
  Apple,
  CalendarDays,
  CreditCard,
  Receipt,
  AlertTriangle,
  BarChart3,
  CalendarRange,
  UserCog,
  FileWarning,
  Wallet,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkBase = "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors";
const linkActive = "bg-navy text-white";
const linkInactive = "text-white/75 hover:bg-white/10 hover:text-white";

const NavItem = ({ to, icon: Icon, children, end, onClick }) => (
  <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
    {Icon && <Icon size={17} className="shrink-0" />}
    <span>{children}</span>
  </NavLink>
);

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const canFinance = user?.role === "admin" || user?.canManageFinance;
  const [reportsOpen, setReportsOpen] = useState(true);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden print:hidden" onClick={onClose} />}

      <aside
        className={`w-64 bg-gradient-to-b from-navy via-navy-light to-navy-dark flex flex-col shrink-0 print:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 md:relative md:translate-x-0 md:z-auto relative overflow-hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative px-5 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-serif font-bold text-sm shrink-0 shadow-sm">
            TS
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-serif text-lg leading-tight truncate">Taysiir KM13</h1>
            <p className="text-white/50 text-xs mt-0.5 truncate">Restaurant &amp; Meal System</p>
          </div>
          <button onClick={onClose} className="md:hidden text-white/60 hover:text-white shrink-0">
            <X size={20} />
          </button>
        </div>

        <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/dashboard" end icon={LayoutDashboard} onClick={onClose}>Dashboard</NavItem>
          <NavItem to="/students" icon={GraduationCap} onClick={onClose}>Ardayda</NavItem>
          <NavItem to="/parents" icon={Users} onClick={onClose}>Waalidiinta</NavItem>
          <NavItem to="/classes" icon={Layers} onClick={onClose}>Fasallada</NavItem>
          <NavItem to="/meal-plans" icon={Utensils} onClick={onClose}>Meal Plans</NavItem>
          <NavItem to="/attendance" icon={UtensilsCrossed} onClick={onClose}>Cuntada Maalinlaha</NavItem>
          <NavItem to="/occasional-meals" icon={UserRound} onClick={onClose}>Cunto Mar-mar ah</NavItem>
          <NavItem to="/foods" icon={Apple} onClick={onClose}>Cuntooyinka</NavItem>
          <NavItem to="/menu" icon={CalendarDays} onClick={onClose}>Menu-ga</NavItem>
          <NavItem to="/invoices" icon={Receipt} onClick={onClose}>Invoices</NavItem>
          <NavItem to="/payments" icon={CreditCard} onClick={onClose}>Lacag Bixinta</NavItem>
          <NavItem to="/outstanding-balances" icon={AlertTriangle} onClick={onClose}>Deymaha</NavItem>
          <NavItem to="/expenses" icon={Wallet} onClick={onClose}>Kharashaadka</NavItem>

          <button
            onClick={() => setReportsOpen((o) => !o)}
            className={`${linkBase} ${linkInactive} w-full justify-between`}
          >
            <span className="flex items-center gap-3">
              <BarChart3 size={17} className="shrink-0" />
              Warbixinnada
            </span>
            {reportsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          {reportsOpen && (
            <div className="pl-4 space-y-1">
              <NavItem to="/reports/monthly" onClick={onClose}>Warbixin Bille</NavItem>
              <NavItem to="/reports/annual" onClick={onClose}>Warbixin Sannadeed</NavItem>
              <NavItem to="/reports/profit-loss" onClick={onClose}>Xisaab-xirka</NavItem>
            </div>
          )}

          <NavItem to="/calendar" icon={CalendarRange} onClick={onClose}>Kalandarka Dugsiga</NavItem>
          <NavItem to="/holidays" icon={CalendarRange} onClick={onClose}>Fasaxyada &amp; Lacagta</NavItem>
          {canFinance && <NavItem to="/academic-years" icon={GraduationCap} onClick={onClose}>Sannadaha Dugsiga</NavItem>}
          {user?.role === "admin" && <NavItem to="/users" icon={UserCog} onClick={onClose}>Isticmaalayaasha</NavItem>}
          {user?.role === "admin" && <NavItem to="/audit-logs" icon={FileWarning} onClick={onClose}>Audit Logs</NavItem>}
          <NavItem to="/settings" icon={SettingsIcon} onClick={onClose}>Dejinta</NavItem>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
