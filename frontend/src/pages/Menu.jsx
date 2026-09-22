import { useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import api from "../api/axios";
import { todayIso, mealTypeLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const weekRange = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  const day = d.getUTCDay();
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setUTCDate(monday.getUTCDate() + i);
    return x.toISOString().slice(0, 10);
  });
  return days;
};

const Menu = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(todayIso());
  const [mealType, setMealType] = useState("lunch");
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState([]);
  const [weekMenus, setWeekMenus] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const days = weekRange(date);

  const loadWeek = () => {
    api.get("/menus", { params: { startDate: days[0], endDate: days[6] } }).then((res) => setWeekMenus(res.data.menus));
  };

  useEffect(() => {
    api.get("/foods", { params: { activeOnly: "true" } }).then((res) => setFoods(res.data.foods));
  }, []);

  useEffect(loadWeek, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const existing = weekMenus.find((m) => m.date.slice(0, 10) === date && m.mealType === mealType);
    setSelected(existing ? existing.items.map((it) => it.foodId) : []);
  }, [date, mealType, weekMenus]);

  const toggleFood = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/menus", { date, mealType, foodIds: selected });
      loadWeek();
    } finally {
      setSaving(false);
    }
  };

  const copyFromYesterday = async () => {
    const yesterday = new Date(`${date}T00:00:00.000Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    await api.post("/menus/copy", { fromDate: yesterday.toISOString().slice(0, 10), toDate: date });
    loadWeek();
  };

  const menuFor = (d, mt) => weekMenus.find((m) => m.date.slice(0, 10) === d && m.mealType === mt);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Menu-ga</h1>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div><label className="label-field">Taariikh</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <label className="label-field">Nooca Cuntada</label>
            <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
              {MEAL_TYPES.map((t) => <option key={t} value={t}>{mealTypeLabel(t)}</option>)}
            </select>
          </div>
          <button onClick={copyFromYesterday} className="btn-secondary flex items-center gap-2 text-sm"><Copy size={14} /> Ka koobi shalay</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving ? "..." : "Kaydi Menu-ga"}</button>
          {user?.role === "admin" && selected.length > 0 && (
            <button onClick={() => setConfirmClear(true)} className="text-danger/70 hover:text-danger flex items-center gap-1.5 text-sm">
              <Trash2 size={14} /> Tirtir Menu-gan
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {foods.map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-sm border border-line rounded-md px-3 py-2">
              <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleFood(f.id)} /> {f.name}
            </label>
          ))}
          {foods.length === 0 && <p className="text-ink/40 text-sm col-span-full">Weli cunto lama darin ("Cuntooyinka" bogga).</p>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Menu-ga Toddobaadka</h2>
        <table className="table-base">
          <thead><tr><th>Nooca</th>{days.map((d) => <th key={d}>{d.slice(5)}</th>)}</tr></thead>
          <tbody>
            {MEAL_TYPES.map((mt) => (
              <tr key={mt}>
                <td className="capitalize font-medium">{mealTypeLabel(mt)}</td>
                {days.map((d) => {
                  const m = menuFor(d, mt);
                  return <td key={d} className="text-xs">{m ? m.items.map((it) => it.food.name).join(", ") || "-" : "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => { await api.delete("/menus", { params: { date, mealType } }); loadWeek(); }}
        title="Tirtir Menu-ga"
        description={`Ma hubtaa inaad tirtirayso menu-ga ${mealTypeLabel(mealType)} ee ${date}?`}
      />
    </div>
  );
};

export default Menu;
