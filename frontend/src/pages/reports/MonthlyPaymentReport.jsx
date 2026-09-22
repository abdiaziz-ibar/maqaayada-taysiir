import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import api from "../../api/axios";
import { formatMoney, statusBadgeClass, statusLabel, monthLabel, exportToExcel } from "../../utils/format";

const MonthlyPaymentReport = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/reports/monthly-payments", { params: { year, month } }).then((res) => setRows(res.data.rows));
  }, [year, month]);

  const totals = rows.reduce((acc, r) => ({ totalDue: acc.totalDue + r.totalDue, paid: acc.paid + r.paid, balance: acc.balance + r.balance }), { totalDue: 0, paid: 0, balance: 0 });

  const doExport = () => exportToExcel(rows.map((r) => ({ Waalid: r.parent.fullName, Carruur: r.students, "La Rabo": r.totalDue, "La Bixiyey": r.paid, "Ku Dhiman": r.balance, Xaalada: r.status })), `monthly-payments-${year}-${month}`);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Warbixinta Lacagta Bille</h1>
        <div className="flex items-center gap-2">
          <select className="input-field !w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <input type="number" className="input-field !w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <button onClick={doExport} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14} /> Excel</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Waalid</th><th className="text-center">Carruur</th><th className="text-right">La Rabo</th><th className="text-right">La Bixiyey</th><th className="text-right">Ku Dhiman</th><th>Xaalada</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.parent.id}>
                <td>{r.parent.fullName}</td>
                <td className="text-center">{r.students}</td>
                <td className="text-right">{formatMoney(r.totalDue)}</td>
                <td className="text-right">{formatMoney(r.paid)}</td>
                <td className="text-right">{formatMoney(r.balance)}</td>
                <td><span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="text-center text-ink/40 py-6">Invoice lama helin bishaan.</td></tr>}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="font-semibold">
                <td>Wadarta</td><td></td>
                <td className="text-right">{formatMoney(totals.totalDue)}</td>
                <td className="text-right">{formatMoney(totals.paid)}</td>
                <td className="text-right">{formatMoney(totals.balance)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default MonthlyPaymentReport;
