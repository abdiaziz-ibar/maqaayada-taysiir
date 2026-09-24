import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatDate, formatMoney, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const HolidayModal = ({ open, onClose, onSaved, editing }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("school");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name); setStartDate(editing.startDate.slice(0, 10)); setEndDate(editing.endDate.slice(0, 10));
      setType(editing.type); setDescription(editing.description || "");
    } else {
      setName(""); setStartDate(""); setEndDate(""); setType("school"); setDescription("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name, startDate, endDate, type, description: description || undefined };
      if (editing) await api.put(`/holidays/${editing.id}`, payload);
      else await api.post("/holidays", payload);
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
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Fasaxa" : "Fasax Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div><label className="label-field">Magaca Fasaxa</label><input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="label-field">Bilowga</label><input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} required /></div>
          <div><label className="label-field">Dhammaadka</label><input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} required /></div>
          <div>
            <label className="label-field">Nooca</label>
            <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="school">School</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div><label className="label-field">Faahfaahin (ikhtiyaari)</label><input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const AddAdjustmentForm = ({ holidays, mealPlans, onCreated }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [adjustmentType, setAdjustmentType] = useState("half");
  const [customAmount, setCustomAmount] = useState("");
  const [holidayId, setHolidayId] = useState("");
  const [mealPlanId, setMealPlanId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    try {
      await api.post("/fee-adjustments", {
        year: Number(year), month: Number(month), adjustmentType,
        customAmount: adjustmentType === "custom" ? Number(customAmount) : undefined,
        holidayId: holidayId || undefined, mealPlanId: mealPlanId || undefined,
      });
      setMessage("Beddelka lacagta waa la kaydiyay.");
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
      {message && <div className="bg-success/10 text-success text-sm rounded-md px-3 py-2">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="label-field">Bil</label>
          <select className="input-field" value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
        <div><label className="label-field">Sanad</label><input type="number" className="input-field" value={year} onChange={(e) => setYear(e.target.value)} /></div>
      </div>
      <div>
        <label className="label-field">Nooca Beddelka</label>
        <select className="input-field" value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)}>
          <option value="full">Qiimo Buuxa (Full)</option>
          <option value="half">Nus Qiimo (Half)</option>
          <option value="custom">Qiimo Gaar ah (Custom)</option>
          <option value="none">Lacag La'aan (None)</option>
        </select>
      </div>
      {adjustmentType === "custom" && (
        <div><label className="label-field">Qadarka Gaarka ah</label><input type="number" step="0.01" className="input-field" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} required /></div>
      )}
      <div>
        <label className="label-field">Meal Plan (ka bood haddii ay khusayso dhammaan)</label>
        <select className="input-field" value={mealPlanId} onChange={(e) => setMealPlanId(e.target.value)}>
          <option value="">-- Dhammaan Meal Plans --</option>
          {mealPlans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label-field">Fasax La Xidhiidha (ikhtiyaari)</label>
        <select className="input-field" value={holidayId} onChange={(e) => setHolidayId(e.target.value)}>
          <option value="">-- Ma jiro --</option>
          {holidays.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi Beddelka"}</button>
    </form>
  );
};

const Holidays = () => {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.canManageFinance;
  const [holidays, setHolidays] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingHoliday, setDeletingHoliday] = useState(null);
  const [deletingAdjustment, setDeletingAdjustment] = useState(null);

  const load = () => {
    api.get("/holidays").then((res) => setHolidays(res.data.holidays));
    api.get("/meal-plans").then((res) => setMealPlans(res.data.mealPlans));
    api.get("/fee-adjustments").then((res) => setAdjustments(res.data.feeAdjustments));
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Fasaxyada Dugsiga</h1>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Fasax Cusub</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Magaca</th><th>Bilowga</th><th>Dhammaadka</th><th>Nooca</th><th></th></tr></thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td><td>{formatDate(h.startDate)}</td><td>{formatDate(h.endDate)}</td><td className="capitalize">{h.type}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditing(h); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>
                    {user?.role === "admin" && <button onClick={() => setDeletingHoliday(h)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {holidays.length === 0 && <tr><td colSpan={5} className="text-center text-ink/40 py-4">Fasax lama helin.</td></tr>}
          </tbody>
        </table>
      </div>

      {canManage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h2 className="text-lg mb-3">Beddelka Lacagta Bille (Fee Adjustment)</h2>
            <p className="text-xs text-ink/50 mb-3">Haddii bishu leedahay fasax dheer, halkan ka dejii sida lacagta bishaas loo xisaabin doono.</p>
            <AddAdjustmentForm holidays={holidays} mealPlans={mealPlans} onCreated={load} />
          </div>
          <div className="card overflow-x-auto">
            <h2 className="text-lg mb-3">Beddelada Jira</h2>
            <table className="table-base">
              <thead><tr><th>Bishii</th><th>Nooca</th><th>Meal Plan</th><th></th></tr></thead>
              <tbody>
                {adjustments.map((a) => (
                  <tr key={a.id}>
                    <td>{monthLabel(a.month)} {a.year}</td>
                    <td className="capitalize">{a.adjustmentType}{a.adjustmentType === "custom" ? ` (${formatMoney(a.customAmount)})` : ""}</td>
                    <td>{a.mealPlan?.name || "Dhammaan"}</td>
                    <td>{user?.role === "admin" && <button onClick={() => setDeletingAdjustment(a)} className="text-danger/70 hover:text-danger"><Trash2 size={14} /></button>}</td>
                  </tr>
                ))}
                {adjustments.length === 0 && <tr><td colSpan={4} className="text-center text-ink/40 py-4">Beddel lama dejin.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HolidayModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deletingHoliday}
        onClose={() => setDeletingHoliday(null)}
        onConfirm={async () => { await api.delete(`/holidays/${deletingHoliday.id}`); load(); }}
        title="Tirtir Fasaxa"
        description={deletingHoliday ? `Ma hubtaa inaad tirtirayso "${deletingHoliday.name}"?` : ""}
      />
      <ConfirmDeleteModal
        open={!!deletingAdjustment}
        onClose={() => setDeletingAdjustment(null)}
        onConfirm={async () => { await api.delete(`/fee-adjustments/${deletingAdjustment.id}`); load(); }}
        title="Tirtir Beddelka Lacagta"
        description={deletingAdjustment ? `Ma hubtaa inaad tirtirayso beddelka bisha ${monthLabel(deletingAdjustment.month)} ${deletingAdjustment.year}?` : ""}
      />
    </div>
  );
};

export default Holidays;
