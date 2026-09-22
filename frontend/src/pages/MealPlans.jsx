import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const MealPlanModal = ({ open, onClose, onSaved, editing }) => {
  const [name, setName] = useState("");
  const [mealTypes, setMealTypes] = useState([]);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) { setName(editing.name); setMealTypes(editing.mealTypes); setMonthlyPrice(String(editing.monthlyPrice)); }
    else { setName(""); setMealTypes([]); setMonthlyPrice(""); }
  }, [open, editing]);

  if (!open) return null;

  const toggleType = (t) => setMealTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mealTypes.length === 0) return setError("Dooro ugu yaraan hal nooc oo cunto ah.");
    setLoading(true);
    try {
      const payload = { name, mealTypes, monthlyPrice: Number(monthlyPrice) };
      if (editing) await api.put(`/meal-plans/${editing.id}`, payload);
      else await api.post("/meal-plans", payload);
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
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Meal Plan-ka" : "Meal Plan Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Magaca (tusaale: "KG Full Board")</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label-field">Noocyada Cuntada</label>
            <div className="flex gap-2">
              {MEAL_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-sm capitalize">
                  <input type="checkbox" checked={mealTypes.includes(t)} onChange={() => toggleType(t)} /> {t}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label-field">Qiimaha Bishii</label>
            <input type="number" step="0.01" className="input-field" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const MealPlans = () => {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.canManageFinance;
  const [plans, setPlans] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/meal-plans").then((res) => setPlans(res.data.mealPlans));
  useEffect(() => { load(); }, []);

  const toggleActive = async (plan) => {
    await api.put(`/meal-plans/${plan.id}`, { isActive: !plan.isActive });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Meal Plans</h1>
        {canManage && (
          <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Meal Plan Cusub
          </button>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Magaca</th><th>Noocyada</th><th className="text-right">Qiimaha Bishii</th><th>Xaalada</th>{canManage && <th></th>}</tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="capitalize">{p.mealTypes.join(", ")}</td>
                <td className="text-right">{formatMoney(p.monthlyPrice)}</td>
                <td><span className={`badge ${p.isActive ? "badge-paid" : "badge-unpaid"}`}>{p.isActive ? "Firfircoon" : "Xiran"}</span></td>
                {canManage && (
                  <td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleActive(p)} className="text-link text-sm hover:underline">{p.isActive ? "Xir" : "Furan"}</button>
                      <button onClick={() => { setEditing(p); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>
                      {user?.role === "admin" && <button onClick={() => setDeleting(p)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {plans.length === 0 && <tr><td colSpan={5} className="text-center text-ink/40 py-6">Meal plan lama helin.</td></tr>}
          </tbody>
        </table>
      </div>

      <MealPlanModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/meal-plans/${deleting.id}`); load(); }}
        title="Tirtir Meal Plan-ka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.name}"? Ardayda ku jira waxay dhici doonaan "mar-mar cunta oo kaliya".` : ""}
      />
    </div>
  );
};

export default MealPlans;
