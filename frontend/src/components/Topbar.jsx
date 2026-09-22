import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!q.trim()) return setResults(null);
    const t = setTimeout(() => {
      api.get("/search", { params: { q } }).then((res) => setResults(res.data));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setResults(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goTo = (path) => {
    setQ("");
    setResults(null);
    navigate(path);
  };

  return (
    <div ref={boxRef} className="relative flex-1 max-w-xs hidden sm:block">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
      <input
        className="input-field !py-1.5 pl-8 text-sm"
        placeholder="Raadi arday, waalid, fasal..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results && (results.students.length > 0 || results.parents.length > 0 || results.classes.length > 0) && (
        <div className="absolute mt-1 w-full bg-surface border border-line rounded-md shadow-lg z-50 max-h-72 overflow-y-auto text-sm">
          {results.students.map((s) => (
            <button key={s.id} onClick={() => goTo(`/students/${s.id}`)} className="block w-full text-left px-3 py-2 hover:bg-paper">
              🎓 {s.label} {s.className ? `· ${s.className}` : ""}
            </button>
          ))}
          {results.parents.map((p) => (
            <button key={p.id} onClick={() => goTo(`/parents/${p.id}`)} className="block w-full text-left px-3 py-2 hover:bg-paper">
              👤 {p.label}
            </button>
          ))}
          {results.classes.map((c) => (
            <button key={c.id} onClick={() => goTo(`/students?classId=${c.id}`)} className="block w-full text-left px-3 py-2 hover:bg-paper">
              🏫 {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const NotificationsBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    api.get("/notifications").then((res) => setNotifications(res.data.notifications)).catch(() => {});
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative text-ink/60 hover:text-ink p-1" title="Ogeysiisyada">
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-surface border border-line rounded-md shadow-lg z-50 text-sm max-h-80 overflow-y-auto">
          {notifications.length === 0 && <p className="px-3 py-4 text-ink/40 text-center">Ogeysiis lama helin.</p>}
          {notifications.map((n, i) => (
            <div key={i} className="px-3 py-2 border-b border-line last:border-0">{n.message}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-surface border border-line rounded-full shadow-sm mx-2 mt-2 md:mx-4 md:mt-4 px-3 md:px-6 py-2 md:py-3 flex items-center justify-between gap-3 print:hidden print:m-0 print:rounded-none print:border-0 print:shadow-none">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <button onClick={onMenuClick} className="md:hidden text-ink/70 hover:text-ink shrink-0 p-1">
          <Menu size={20} />
        </button>
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <NotificationsBell />
        <span className="text-sm text-ink/70 hidden sm:inline truncate max-w-[120px]">{user?.fullName}</span>
        <button onClick={logout} className="text-sm text-danger border border-line rounded-full px-3 py-1.5 hover:bg-paper transition-colors">
          Ka Bax
        </button>
      </div>
    </header>
  );
};

export default Topbar;
