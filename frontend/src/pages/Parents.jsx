import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";

const ParentModal = ({ open, onClose, onSaved, editing }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setFullName(editing.fullName); setPhone(editing.phone); setAlternativePhone(editing.alternativePhone || "");
      setAddress(editing.address || ""); setEmail(editing.email || "");
    } else {
      setFullName(""); setPhone(""); setAlternativePhone(""); setAddress(""); setEmail("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { fullName, phone, alternativePhone: alternativePhone || undefined, address: address || undefined, email: email || undefined };
      if (editing) await api.put(`/parents/${editing._id}`, payload);
      else await api.post("/parents", payload);
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
      <div className="bg-surface rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Waalidka" : "Waalid Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Magaca Waalidka</label>
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Telefoonka</label>
            <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Telefoon Kale (ikhtiyaari)</label>
            <input className="input-field" value={alternativePhone} onChange={(e) => setAlternativePhone(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Cinwaanka (ikhtiyaari)</label>
            <input className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="label-field">Email (ikhtiyaari)</label>
            <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Waa la kaydinayaa..." : "Kaydi"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Parents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/parents", { params: search ? { search } : {} }).then((res) => setParents(res.data.parents)).finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Waalidiinta</h1>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Waalid Cusub
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
        <input className="input-field pl-9" placeholder="Raadi magac ama telefoon..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr><th>Code</th><th>Magaca</th><th>Telefoonka</th><th>Ardayda</th><th>Xaalada</th><th></th></tr>
          </thead>
          <tbody>
            {parents.map((p) => (
              <tr key={p._id} className="cursor-pointer hover:bg-paper" onClick={() => navigate(`/parents/${p._id}`)}>
                <td>{p.parentCode}</td>
                <td>{p.fullName}</td>
                <td>{p.phone}</td>
                <td>{p.students?.map((s) => s.fullName).join(", ") || "-"}</td>
                <td>
                  <span className={`badge ${p.status === "active" ? "badge-paid" : "badge-unpaid"}`}>
                    {p.status === "active" ? "Firfircoon" : "Aan Firfircoonayn"}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditing(p); setShowAdd(true); }} className="text-ink/50 hover:text-ink" title="Wax ka beddel">
                      <Pencil size={15} />
                    </button>
                    {user?.role === "admin" && (
                      <button onClick={() => setDeleting(p)} className="text-danger/70 hover:text-danger" title="Tirtir">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && parents.length === 0 && (
              <tr><td colSpan={6} className="text-center text-ink/40 py-6">Waalid lama helin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ParentModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/parents/${deleting._id}`); load(); }}
        title="Tirtir Waalidka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"? Waxaa la tirtiri doonaa dhammaan ardaydiisa iyo xogtooda oo dhan (invoice, cunto, lacag).` : ""}
      />
    </div>
  );
};

export default Parents;
