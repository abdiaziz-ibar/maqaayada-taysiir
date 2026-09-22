import { useEffect, useState } from "react";
import { Check, X as XIcon, Download, RotateCcw } from "lucide-react";
import api from "../api/axios";
import { todayIso, mealTypeLabel, formatDate, exportToExcel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

const RosterCard = ({ row, onMark, marking, onReset, canReset }) => (
  <div className="card flex items-center justify-between gap-3 flex-wrap">
    <div>
      <p className="font-medium">{row.fullName}</p>
      <p className="text-xs text-ink/50">{row.studentCode} {row.className ? `· ${row.className}` : ""} {row.sectionName ? `(${row.sectionName})` : ""}</p>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => onMark(row.studentId, true)}
        disabled={marking === row.studentId}
        className={`flex items-center gap-1.5 px-4 py-3 rounded-lg font-semibold text-white text-sm transition-colors ${row.status === "ate" ? "bg-success" : "bg-success/30 hover:bg-success"}`}
      >
        <Check size={18} /> CUNAY
      </button>
      <button
        onClick={() => onMark(row.studentId, false)}
        disabled={marking === row.studentId}
        className={`flex items-center gap-1.5 px-4 py-3 rounded-lg font-semibold text-white text-sm transition-colors ${row.status === "did_not_eat" ? "bg-danger" : "bg-danger/30 hover:bg-danger"}`}
      >
        <XIcon size={18} /> MA CUNIN
      </button>
      {canReset && row.recordId && (
        <button onClick={() => onReset(row)} title="Tirtir diiwaanka (dib u dej)" className="text-ink/40 hover:text-danger px-2">
          <RotateCcw size={16} />
        </button>
      )}
    </div>
  </div>
);

const Attendance = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(todayIso());
  const [mealType, setMealType] = useState("lunch");
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(null);
  const [tab, setTab] = useState("roster"); // roster | who-ate | who-did-not-eat
  const [reportRows, setReportRows] = useState([]);
  const [resetting, setResetting] = useState(null);

  useEffect(() => { api.get("/classes").then((res) => setClasses(res.data.classes)); }, []);

  const selectedClass = classes.find((c) => c.id === classId);

  const loadRoster = () => {
    setLoading(true);
    api
      .get("/attendance", { params: { date, mealType, ...(classId ? { classId } : {}), ...(sectionId ? { sectionId } : {}) } })
      .then((res) => setRoster(res.data.roster))
      .finally(() => setLoading(false));
  };

  const loadReport = (which) => {
    setLoading(true);
    api
      .get(`/attendance/${which}`, { params: { date, mealType, ...(classId ? { classId } : {}), ...(sectionId ? { sectionId } : {}) } })
      .then((res) => setReportRows(res.data.records))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === "roster") loadRoster();
    else loadReport(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, mealType, classId, sectionId, tab]);

  const mark = async (studentId, ate) => {
    setMarking(studentId);
    try {
      await api.put(`/attendance/${studentId}`, { date, mealType, ate });
      loadRoster();
    } finally {
      setMarking(null);
    }
  };

  const doExport = () => {
    const rows = reportRows.map((r) => ({
      Taariikh: formatDate(r.date),
      Nooca: mealTypeLabel(r.mealType),
      Arday: r.student.fullName,
      Fasal: r.student.class?.name || "",
      Waalid: r.student.parent?.fullName || "",
      Telefoon: r.student.parent?.phone || "",
    }));
    exportToExcel(rows, `${tab}-${date}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Cuntada Maalinlaha</h1>

      <div className="card flex flex-wrap items-end gap-3">
        <div><label className="label-field">Taariikh</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div>
          <label className="label-field">Nooca Cuntada</label>
          <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEAL_TYPES.map((t) => <option key={t} value={t}>{mealTypeLabel(t)}</option>)}
          </select>
        </div>
        <div>
          <label className="label-field">Fasalka</label>
          <select className="input-field" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
            <option value="">-- Dhammaan --</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedClass?.sections?.length > 0 && (
          <div>
            <label className="label-field">Qaybta</label>
            <select className="input-field" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
              <option value="">-- Dhammaan --</option>
              {selectedClass.sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 bg-paper rounded-full p-1 max-w-md">
        {[["roster", "Diiwaan Geli"], ["who-ate", "Kuwa Cunay"], ["who-did-not-eat", "Kuwa Aan Cunin"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 py-1.5 rounded-full text-sm transition-colors ${tab === key ? "bg-surface shadow-sm" : "text-ink/50"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "roster" && (
        <div className="space-y-2">
          {roster.map((row) => (
            <RosterCard key={row.studentId} row={row} onMark={mark} marking={marking} onReset={setResetting} canReset={user?.role === "admin"} />
          ))}
          {!loading && roster.length === 0 && <p className="text-center text-ink/40 py-6">Arday la sugayo lama helin ({mealTypeLabel(mealType)}-ka).</p>}
        </div>
      )}

      {tab !== "roster" && (
        <div className="card overflow-x-auto">
          <div className="flex justify-end mb-2">
            <button onClick={doExport} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14} /> Excel</button>
          </div>
          <table className="table-base">
            <thead><tr><th>Taariikh</th><th>Arday</th><th>Fasal</th><th>Waalid</th></tr></thead>
            <tbody>
              {reportRows.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.student.fullName}</td>
                  <td>{r.student.class?.name || "-"}</td>
                  <td>{r.student.parent?.fullName} ({r.student.parent?.phone})</td>
                </tr>
              ))}
              {reportRows.length === 0 && <tr><td colSpan={4} className="text-center text-ink/40 py-6">Wax lama helin.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!resetting}
        onClose={() => setResetting(null)}
        onConfirm={async () => { await api.delete(`/attendance/record/${resetting.recordId}`); loadRoster(); }}
        title="Tirtir Diiwaanka"
        description={resetting ? `Ma hubtaa inaad tirtirayso diiwaanka "${resetting.fullName}" ee ${mealTypeLabel(mealType)}?` : ""}
      />
    </div>
  );
};

export default Attendance;
