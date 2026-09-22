import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const UserModal = ({ open, onClose, onSaved, editing }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [canManageFinance, setCanManageFinance] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setFullName(editing.fullName); setUsername(editing.username); setRole(editing.role); setCanManageFinance(editing.canManageFinance);
    } else {
      setFullName(""); setUsername(""); setRole("staff"); setCanManageFinance(false);
    }
    setPassword("");
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, { fullName, role, canManageFinance, password: password || undefined });
      } else {
        await api.post("/users", { fullName, username, password, role, canManageFinance });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Isticmaalaha" : "Isticmaale Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div><label className="label-field">Magaca</label><input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
          <div>
            <label className="label-field">Username</label>
            <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={!!editing} />
          </div>
          <div>
            <label className="label-field">{editing ? "Password Cusub (ka bood haddii aadan beddeli lahayn)" : "Password"}</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required={!editing} />
          </div>
          <div>
            <label className="label-field">Doorka (Role)</label>
            <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">Restaurant Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {role === "staff" && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={canManageFinance} onChange={(e) => setCanManageFinance(e.target.checked)} /> Ogolow inuu maareeyo dejinta maaliyadda
            </label>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/users").then((res) => setUsers(res.data.users));
  useEffect(() => { load(); }, []);

  const toggleStatus = async (u) => {
    await api.put(`/users/${u._id}`, { status: u.status === "active" ? "inactive" : "active" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Isticmaalayaasha</h1>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Isticmaale Cusub</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Magaca</th><th>Username</th><th>Doorka</th><th>Maaliyad</th><th>Xaalada</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.username}</td>
                <td className="capitalize">{u.role}</td>
                <td>
                  {u.role === "staff" ? (
                    <span className={`badge ${u.canManageFinance ? "badge-paid" : "badge-unpaid"}`}>{u.canManageFinance ? "Ogolaaday" : "Lama Ogolayn"}</span>
                  ) : (
                    <span className="text-ink/40 text-sm">—</span>
                  )}
                </td>
                <td><span className={`badge ${u.status === "active" ? "badge-paid" : "badge-unpaid"}`}>{u.status === "active" ? "Firfircoon" : "Xiran"}</span></td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(u)} className="text-link text-sm hover:underline">{u.status === "active" ? "Xir" : "Furan"}</button>
                    <button onClick={() => { setEditing(u); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>
                    {u._id !== me?._id && <button onClick={() => setDeleting(u)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/users/${deleting._id}`); load(); }}
        title="Tirtir Isticmaalaha"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"?` : ""}
      />
    </div>
  );
};

export default Users;
