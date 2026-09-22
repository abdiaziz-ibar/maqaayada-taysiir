import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";

const AddSectionForm = ({ classId, onAdded }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post(`/classes/${classId}/sections`, { name });
      setName("");
      onAdded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input className="input-field !py-1 !text-sm !w-24" placeholder="Section" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit" disabled={loading} className="text-link text-sm hover:underline">+ dar</button>
    </form>
  );
};

const SectionRow = ({ classId, section, onChanged, canDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(section.name);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    await api.put(`/classes/${classId}/sections/${section.id}`, { name });
    setEditing(false);
    onChanged();
  };

  if (editing) {
    return (
      <span className="flex items-center gap-1">
        <input className="input-field !py-0.5 !text-xs !w-16" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <button onClick={save} className="text-link text-xs hover:underline">kaydi</button>
      </span>
    );
  }

  return (
    <>
      <span className="badge bg-navy/10 text-navy flex items-center gap-1">
        {section.name}
        <button onClick={() => setEditing(true)}><Pencil size={11} /></button>
        {canDelete && <button onClick={() => setDeleting(true)}><Trash2 size={11} className="text-danger" /></button>}
      </span>
      <ConfirmDeleteModal
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={async () => { await api.delete(`/classes/${classId}/sections/${section.id}`); onChanged(); }}
        title="Tirtir Qaybta"
        description={`Ma hubtaa inaad tirtirayso section "${section.name}"?`}
      />
    </>
  );
};

const ClassModal = ({ open, onClose, onSaved, editing }) => {
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) { setName(editing.name); setOrder(String(editing.order)); }
    else { setName(""); setOrder(""); }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, order: order !== "" ? Number(order) : undefined };
      if (editing) await api.put(`/classes/${editing.id}`, payload);
      else await api.post("/classes", payload);
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
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Fasalka" : "Fasal Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Magaca Fasalka</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Tartiibka (order, ikhtiyaari)</label>
            <input type="number" className="input-field" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const Classes = () => {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.canManageFinance;
  const [classes, setClasses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/classes").then((res) => setClasses(res.data.classes));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Fasallada</h1>
        {canManage && (
          <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Fasal Cusub
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg">{c.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`badge ${c.isActive ? "badge-paid" : "badge-unpaid"}`}>{c.isActive ? "Firfircoon" : "Xiran"}</span>
                {canManage && (
                  <button onClick={() => { setEditing(c); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={14} /></button>
                )}
                {user?.role === "admin" && (
                  <button onClick={() => setDeleting(c)} className="text-danger/70 hover:text-danger"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {c.sections.map((s) => <SectionRow key={s.id} classId={c.id} section={s} onChanged={load} canDelete={user?.role === "admin"} />)}
              {c.sections.length === 0 && <span className="text-xs text-ink/40">Ma jiraan sections</span>}
            </div>
            {canManage && <AddSectionForm classId={c.id} onAdded={load} />}
          </div>
        ))}
      </div>

      <ClassModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/classes/${deleting.id}`); load(); }}
        title="Tirtir Fasalka"
        description={deleting ? `Ma hubtaa inaad tirtirayso fasalka "${deleting.name}"? Ardayda ku jira waxay dhici doonaan "Ma jiro fasal".` : ""}
      />
    </div>
  );
};

export default Classes;
