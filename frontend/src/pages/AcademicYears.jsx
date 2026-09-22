import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const YearModal = ({ open, onClose, onSaved, editing }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setStartDate(editing.startDate.slice(0, 10)); setEndDate(editing.endDate.slice(0, 10)); setIsActive(editing.isActive);
    } else {
      setName(""); setStartDate(""); setEndDate(""); setIsActive(false);
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, startDate, endDate, isActive };
      if (editing) await api.put(`/academic-years/${editing.id}`, payload);
      else await api.post("/academic-years", payload);
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
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Sannadka" : "Sannad Dugsiyeed Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Magaca (tusaale: 2027-2028)</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Taariikhda Bilowga</label>
            <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Taariikhda Dhammaadka</label>
            <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Ka dhig kan firfircoon (active)
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const AcademicYears = () => {
  const { user } = useAuth();
  const [years, setYears] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/academic-years").then((res) => setYears(res.data.academicYears));
  useEffect(() => { load(); }, []);

  const makeActive = async (year) => {
    await api.put(`/academic-years/${year.id}`, { isActive: true });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Sannadaha Dugsiga</h1>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Sannad Cusub</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Magaca</th><th>Bilowga</th><th>Dhammaadka</th><th>Xaalada</th><th></th></tr></thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.id}>
                <td>{y.name}</td>
                <td>{formatDate(y.startDate)}</td>
                <td>{formatDate(y.endDate)}</td>
                <td><span className={`badge ${y.isActive ? "badge-paid" : "badge-unpaid"}`}>{y.isActive ? "Firfircoon" : "Aan Firfircoonayn"}</span></td>
                <td>
                  <div className="flex items-center gap-3">
                    {!y.isActive && <button onClick={() => makeActive(y)} className="text-link text-sm hover:underline">Ka dhig Active</button>}
                    <button onClick={() => { setEditing(y); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>
                    {user?.role === "admin" && <button onClick={() => setDeleting(y)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <YearModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/academic-years/${deleting.id}`); load(); }}
        title="Tirtir Sannadka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"? (Waa la diidi doonaa haddii invoice-yo lagu sameeyay.)` : ""}
      />
    </div>
  );
};

export default AcademicYears;
