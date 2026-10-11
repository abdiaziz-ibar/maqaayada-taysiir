import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, AlertTriangle, Users } from "lucide-react";
import api from "../api/axios";
import { formatMoney, exportToExcel, monthLabel } from "../utils/format";

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

const OutstandingBalances = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(currentYear);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { status, ...(month ? { year, month } : {}) };
    api.get("/reports/outstanding-balances", { params }).then((res) => setRows(res.data.rows)).finally(() => setLoading(false));
  }, [status, month, year]);

  const doExport = () => {
    exportToExcel(
      rows.map((r) => ({
        Waalid: r.parent.fullName,
        Telefoon: r.parent.phone,
        Carruur: r.childrenCount,
        "La Rabo": r.totalDue,
        "La Bixiyey": r.totalPaid,
        "La Sugayo": r.outstanding,
        "Bisha Ugu Da'da Badan": r.oldestUnpaidMonth,
      })),
      "outstanding-balances"
    );
  };

  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Deymaha (Outstanding Balances)</h1>
        <div className="flex items-center gap-2">
          <select className="input-field !w-auto" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Dhammaan Bilaha</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
          {month && (
            <select className="input-field !w-auto" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          <select className="input-field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Dhammaan</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button onClick={doExport} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14} /> Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div className="card flex items-center gap-3 p-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 bg-danger">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xl font-display font-semibold leading-none">{formatMoney(totalOutstanding)}</p>
            <p className="text-ink/50 text-xs mt-1.5">Wadarta Deymaha{month ? ` — ${monthLabel(month)} ${year}` : ""}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 bg-[#2D6CDF]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-display font-semibold leading-none">{rows.length}</p>
            <p className="text-ink/50 text-xs mt-1.5">Waalid Deyn Leh</p>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Waalid</th><th>Telefoon</th><th className="text-center">Carruur</th><th className="text-right">La Rabo</th><th className="text-right">La Bixiyey</th><th className="text-right">La Sugayo</th><th>Bisha Ugu Da'da Badan</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.parent.id} className="cursor-pointer hover:bg-paper" onClick={() => navigate(`/parents/${r.parent.id}`)}>
                <td>{r.parent.fullName}</td>
                <td>{r.parent.phone}</td>
                <td className="text-center">{r.childrenCount}</td>
                <td className="text-right">{formatMoney(r.totalDue)}</td>
                <td className="text-right">{formatMoney(r.totalPaid)}</td>
                <td className="text-right text-danger font-medium">{formatMoney(r.outstanding)}</td>
                <td>{r.oldestUnpaidMonth || "-"}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="text-center text-ink/40 py-6">Ma jiraan deymo hadda jira.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutstandingBalances;
