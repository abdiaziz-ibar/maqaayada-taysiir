import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import api from "../api/axios";
import { todayIso, formatDate, mealTypeLabel, formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const OccasionalMeals = () => {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mealType, setMealType] = useState("lunch");
  const [date, setDate] = useState(todayIso());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [meals, setMeals] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadMeals = () => api.get("/occasional-meals").then((res) => setMeals(res.data.meals));
  useEffect(() => { loadMeals(); }, []);

  useEffect(() => {
    if (!q.trim()) return setResults([]);
    const t = setTimeout(() => {
      api.get("/students/search", { params: { q } }).then((res) => setResults(res.data.students));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const record = async () => {
    setError(""); setMessage("");
    setSaving(true);
    try {
      await api.post("/occasional-meals", { studentId: selectedStudent.id, mealType, date });
      setMessage(`${selectedStudent.fullName} waa la diiwaan geliyay (${mealTypeLabel(mealType)}).`);
      setSelectedStudent(null);
      setQ("");
      loadMeals();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id) => {
    setPayingId(id);
    try {
      await api.post(`/occasional-meals/${id}/pay`);
      loadMeals();
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Cunto Mar-mar ah</h1>
      <p className="text-sm text-ink/60">
        Ardaydan waa kuwo horey dugsiga looga diiwaan geliyay laakin aan ku jirin barnaamijka cuntada joogtada ah. Raadi ardayga, dooro nooca cuntada, oo diiwaan geli.
      </p>

      <div className="card space-y-3 max-w-lg">
        {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
        {message && <div className="bg-success/10 text-success text-sm rounded-md px-3 py-2">{message}</div>}

        {!selectedStudent ? (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
            <input className="input-field pl-9" placeholder="Raadi magaca ama code-ka ardayga..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            {results.length > 0 && (
              <div className="mt-1 border border-line rounded-md divide-y divide-line max-h-56 overflow-y-auto">
                {results.map((s) => (
                  <button key={s.id} onClick={() => { setSelectedStudent(s); setResults([]); }} className="block w-full text-left px-3 py-2 hover:bg-paper text-sm">
                    {s.fullName} ({s.studentCode}) {s.class?.name ? `· ${s.class.name}` : ""} {s.mealPlan ? "· leh Meal Plan" : ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-paper rounded-md px-3 py-2">
              <span className="text-sm font-medium">{selectedStudent.fullName} ({selectedStudent.studentCode})</span>
              <button onClick={() => setSelectedStudent(null)} className="text-link text-sm hover:underline">Beddel</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Nooca Cuntada</label>
                <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  {MEAL_TYPES.map((t) => <option key={t} value={t}>{mealTypeLabel(t)}</option>)}
                </select>
              </div>
              <div><label className="label-field">Taariikh</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            </div>
            <button onClick={record} disabled={saving} className="btn-primary w-full">{saving ? "..." : "Diiwaan Geli"}</button>
          </div>
        )}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Taariikhda Cunto Mar-mar ah</h2>
        <table className="table-base">
          <thead><tr><th>Taariikh</th><th>Arday</th><th>Fasal</th><th>Nooca</th><th className="text-right">Qiimaha</th><th>Lacagta</th><th></th></tr></thead>
          <tbody>
            {meals.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.date)}</td>
                <td>{m.student.fullName}</td>
                <td>{m.student.class?.name || "-"}</td>
                <td className="capitalize">{mealTypeLabel(m.mealType)}</td>
                <td className="text-right">{formatMoney(m.amountCharged)}</td>
                <td><span className={`badge ${m.paymentStatus === "paid" ? "badge-paid" : "badge-unpaid"}`}>{m.paymentStatus === "paid" ? "La Bixiyey" : "Lama Bixin"}</span></td>
                <td>
                  <div className="flex items-center gap-3">
                    {m.paymentStatus !== "paid" && <button onClick={() => markPaid(m.id)} disabled={payingId === m.id} className="text-link text-sm hover:underline">Bixi</button>}
                    {user?.role === "admin" && <button onClick={() => setDeleting(m)} className="text-danger/70 hover:text-danger"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {meals.length === 0 && <tr><td colSpan={7} className="text-center text-ink/40 py-6">Weli lama diiwaan gelin.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/occasional-meals/${deleting.id}`); loadMeals(); }}
        title="Tirtir Diiwaanka"
        description={deleting ? `Ma hubtaa inaad tirtirayso diiwaanka "${deleting.student.fullName}" ee ${formatDate(deleting.date)}?` : ""}
      />
    </div>
  );
};

export default OccasionalMeals;
