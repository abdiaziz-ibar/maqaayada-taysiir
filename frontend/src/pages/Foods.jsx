import { useEffect, useState } from "react";
import { Plus, Search, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const FoodModal = ({ open, onClose, onSaved, editing }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [mealType, setMealType] = useState("");
  const [allergens, setAllergens] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setCategory(editing.category || ""); setMealType(editing.mealType || ""); setAllergens(editing.allergens || "");
    } else {
      setName(""); setCategory(""); setMealType(""); setAllergens("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, category: category || undefined, mealType: mealType || undefined, allergens: allergens || undefined };
      if (editing) await api.put(`/foods/${editing.id}`, payload);
      else await api.post("/foods", payload);
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
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Cuntada" : "Cunto Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div><label className="label-field">Magaca</label><input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="label-field">Qaybta (category)</label><input className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="grain, protein, vegetable..." /></div>
          <div>
            <label className="label-field">Nooca Cuntada (ikhtiyaari)</label>
            <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="">-- Kasta --</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
          <div><label className="label-field">Allergens (ikhtiyaari)</label><input className="input-field" value={allergens} onChange={(e) => setAllergens(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const Foods = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/foods", { params: search ? { search } : {} }).then((res) => setFoods(res.data.foods));
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleActive = async (food) => {
    await api.put(`/foods/${food.id}`, { isActive: !food.isActive });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Cuntooyinka</h1>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Cunto Cusub</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
        <input className="input-field pl-9" placeholder="Raadi cunto..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Magaca</th><th>Qaybta</th><th>Nooca</th><th>Allergens</th><th>Xaalada</th><th></th></tr></thead>
          <tbody>
            {foods.map((f) => (
              <tr key={f.id}>
                <td>{f.name}</td>
                <td>{f.category || "-"}</td>
                <td className="capitalize">{f.mealType || "Kasta"}</td>
                <td>{f.allergens || "-"}</td>
                <td><span className={`badge ${f.isActive ? "badge-paid" : "badge-unpaid"}`}>{f.isActive ? "Firfircoon" : "Xiran"}</span></td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleActive(f)} className="text-link text-sm hover:underline">{f.isActive ? "Xir" : "Furan"}</button>
                    <button onClick={() => { setEditing(f); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>
                    {user?.role === "admin" && <button onClick={() => setDeleting(f)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {foods.length === 0 && <tr><td colSpan={6} className="text-center text-ink/40 py-6">Cunto lama helin.</td></tr>}
          </tbody>
        </table>
      </div>

      <FoodModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/foods/${deleting.id}`); load(); }}
        title="Tirtir Cuntada"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"? Haddii ay ku jirto menu hore, isticmaal "Xir" halkii.` : ""}
      />
    </div>
  );
};

export default Foods;
