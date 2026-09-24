import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import api from "../../api/axios";
import { formatMoney, monthLabel } from "../../utils/format";

const ProfitLoss = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/profit-loss", { params: { year, month } }).then((res) => setData(res.data));
  }, [year, month]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Xisaab-xirka (Profit &amp; Loss)</h1>
        <div className="flex items-center gap-2">
          <select className="input-field !w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <input type="number" className="input-field !w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </div>
      </div>

      {!data ? (
        <p className="text-ink/50">Waa la soo shubayaa...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs text-ink/50 uppercase">Wadarta Dakhliga (Income)</p>
              <p className="text-2xl font-serif text-success">{formatMoney(data.income.total)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-ink/50 uppercase">Wadarta Kharashka (Expenses)</p>
              <p className="text-2xl font-serif text-danger">{formatMoney(data.expenses.total)}</p>
            </div>
            <div className={`card border-2 ${data.isLoss ? "border-danger" : "border-success"}`}>
              <p className="text-xs text-ink/50 uppercase flex items-center gap-1.5">
                {data.isLoss ? <TrendingDown size={14} className="text-danger" /> : <TrendingUp size={14} className="text-success" />}
                Farqiga (Net)
              </p>
              <p className={`text-2xl font-serif ${data.isLoss ? "text-danger" : "text-success"}`}>{formatMoney(data.net)}</p>
              <p className={`text-xs mt-1 ${data.isLoss ? "text-danger" : "text-success"}`}>
                {data.isLoss ? "⚠ Qasaaro ayaa jira bishan (Loss)" : "✓ Faa'iido ayaa jira bishan (Profit)"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="text-lg mb-3">Dakhliga (Income)</h2>
              <table className="table-base">
                <tbody>
                  <tr><td>Lacagaha Bille (Meal Fee Payments)</td><td className="text-right">{formatMoney(data.income.mealFeePayments)}</td></tr>
                  <tr><td>Cunto Mar-mar ah (Occasional Meals)</td><td className="text-right">{formatMoney(data.income.occasionalMeals)}</td></tr>
                  <tr className="font-semibold"><td>Wadarta</td><td className="text-right">{formatMoney(data.income.total)}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="card">
              <h2 className="text-lg mb-3">Kharashka (Expenses) — Qaybaha</h2>
              <table className="table-base">
                <tbody>
                  {Object.entries(data.expenses.byCategory).map(([cat, amt]) => (
                    <tr key={cat}><td>{cat}</td><td className="text-right">{formatMoney(amt)}</td></tr>
                  ))}
                  {Object.keys(data.expenses.byCategory).length === 0 && (
                    <tr><td colSpan={2} className="text-center text-ink/40 py-3">Kharash lama diiwaan gelin bishan.</td></tr>
                  )}
                  <tr className="font-semibold"><td>Wadarta</td><td className="text-right">{formatMoney(data.expenses.total)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLoss;
