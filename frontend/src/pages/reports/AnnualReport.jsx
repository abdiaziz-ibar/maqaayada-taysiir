import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../api/axios";
import { formatMoney, monthLabel, exportToExcel } from "../../utils/format";

const AnnualReport = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reports/annual").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-ink/50">Waa la soo shubayaa...</p>;

  const chartData = data.months.map((m) => ({ name: `${monthLabel(m.month)} ${m.year}`, "La Rabo": m.totalDue, "La Bixiyey": m.totalPaid }));
  const doExport = () => exportToExcel(data.months.map((m) => ({ Bishii: `${monthLabel(m.month)} ${m.year}`, "La Rabo": m.totalDue, "La Bixiyey": m.totalPaid, "La Sugayo": m.outstanding })), "annual-report");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Warbixinta Sannadeed — {data.academicYear.name}</h1>
        <button onClick={doExport} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14} /> Excel</button>
      </div>

      <div className="card">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="La Rabo" fill="#1F3A5F" />
              <Bar dataKey="La Bixiyey" fill="#2F7A4D" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-ink/40 text-sm py-8 text-center">Weli invoice lama dhigin sanadkan.</p>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Bishii</th><th className="text-right">La Rabo</th><th className="text-right">La Bixiyey</th><th className="text-right">La Sugayo</th></tr></thead>
          <tbody>
            {data.months.map((m) => (
              <tr key={`${m.year}-${m.month}`}>
                <td>{monthLabel(m.month)} {m.year}</td>
                <td className="text-right">{formatMoney(m.totalDue)}</td>
                <td className="text-right">{formatMoney(m.totalPaid)}</td>
                <td className="text-right">{formatMoney(m.outstanding)}</td>
              </tr>
            ))}
            {data.months.length === 0 && <tr><td colSpan={4} className="text-center text-ink/40 py-6">Ma jiraan xog.</td></tr>}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td>Wadarta Sannadka</td>
              <td className="text-right">{formatMoney(data.totals.totalDue)}</td>
              <td className="text-right">{formatMoney(data.totals.totalPaid)}</td>
              <td className="text-right">{formatMoney(data.totals.outstanding)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default AnnualReport;
