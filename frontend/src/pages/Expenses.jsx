import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatMoney, formatDate, todayIso, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

// Suggestions only — the field is free text, so staff can always type their
// own category (e.g. "Korontada iyo Biyaha") instead of picking one of these.
const CATEGORY_SUGGESTIONS = ["Alaabta Cuntada", "Qalabka", "Korontada iyo Biyaha", "Mushaharka", "Gaadiidka", "Kale"];

const ExpenseModal = ({ open, onClose, onSaved, editing }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setCategory(editing.category); setDescription(editing.description); setAmount(String(editing.amount));
      setDate(editing.date.slice(0, 10)); setPaymentMethod(editing.paymentMethod || "Cash"); setNotes(editing.notes || "");
    } else {
      setCategory(""); setDescription(""); setAmount(""); setDate(todayIso()); setPaymentMethod("Cash"); setNotes("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { category, description, amount: Number(amount), date, paymentMethod, notes: notes || undefined };
      if (editing) await api.put(`/expenses/${editing.id}`, payload);
      else await api.post("/expenses", payload);
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
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Kharashka" : "Kharash Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Qaybta (dooro ama qor mid cusub)</label>
            <input
              className="input-field"
              list="expense-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="tusaale: Korontada iyo Biyaha"
              required
            />
            <datalist id="expense-categories">
              {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div>
            <label className="label-field">Sharaxaad (adeegga/alaabta la iibsaday)</label>
            <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="tusaale: Bariis 50kg, Shidaal, iwm" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label-field">Qadarka Lacagta</label><input type="number" step="0.01" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
            <div><label className="label-field">Taariikh</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
          </div>
          <div>
            <label className="label-field">Habka Lacagta</label>
            <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div><label className="label-field">Faahfaahin (ikhtiyaari)</label><input className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const Expenses = () => {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.canManageFinance;
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/expenses", { params: { year, month } }).then((res) => setExpenses(res.data.expenses)).finally(() => setLoading(false));
  };
  useEffect(load, [year, month]);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Kharashaadka</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select className="input-field !w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <input type="number" className="input-field !w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Kharash Cusub
          </button>
        </div>
      </div>

      <div className="card">
        <p className="text-xs text-ink/50 uppercase">Wadarta Kharashka Bishan</p>
        <p className="text-2xl font-serif text-danger">{formatMoney(total)}</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Taariikh</th><th>Qaybta</th><th>Sharaxaad</th><th className="text-right">Qadarka</th><th>Habka</th><th></th></tr></thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.date)}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td className="text-right">{formatMoney(e.amount)}</td>
                <td>{e.paymentMethod || "-"}</td>
                <td>
                  <div className="flex items-center gap-3">
                    {canEdit && <button onClick={() => { setEditing(e); setShowAdd(true); }} className="text-ink/50 hover:text-ink"><Pencil size={15} /></button>}
                    {user?.role === "admin" && <button onClick={() => setDeleting(e)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && expenses.length === 0 && <tr><td colSpan={6} className="text-center text-ink/40 py-6">Kharash lama diiwaan gelin bishan.</td></tr>}
          </tbody>
        </table>
      </div>

      <ExpenseModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/expenses/${deleting.id}`); load(); }}
        title="Tirtir Kharashka"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.description}" (${formatMoney(deleting.amount)})?` : ""}
      />
    </div>
  );
};

export default Expenses;
