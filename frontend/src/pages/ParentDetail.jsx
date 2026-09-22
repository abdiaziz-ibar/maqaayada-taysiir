import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import api from "../api/axios";
import { formatMoney, formatDate, statusBadgeClass, statusLabel, monthLabel } from "../utils/format";

const ParentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const load = () => api.get(`/parents/${id}`).then((res) => setData(res.data));
  useEffect(() => { load(); }, [id]);

  if (!data) return <p className="text-ink/50">Waa la soo shubayaa...</p>;
  const { parent, students, payments, financialSummary } = data;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-link hover:underline">
        <ArrowLeft size={15} /> Dib u noqo
      </button>

      <div className="card flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl">{parent.fullName}</h1>
          <p className="text-sm text-ink/50">{parent.parentCode} · {parent.phone} {parent.alternativePhone ? `/ ${parent.alternativePhone}` : ""}</p>
          {parent.address && <p className="text-sm text-ink/50">{parent.address}</p>}
        </div>
        <button onClick={() => navigate(`/payments/new?parentId=${parent.id}`)} className="btn-primary flex items-center gap-2">
          <CreditCard size={16} /> Diiwaan Geli Lacag
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-xs text-ink/50 uppercase">Wadarta Lacagta Bishii</p><p className="text-2xl font-serif">{formatMoney(financialSummary.totalMonthlyFees)}</p></div>
        <div className="card"><p className="text-xs text-ink/50 uppercase">La Bixiyey</p><p className="text-2xl font-serif text-success">{formatMoney(financialSummary.totalPaid)}</p></div>
        <div className="card"><p className="text-xs text-ink/50 uppercase">La Sugayo</p><p className="text-2xl font-serif text-danger">{formatMoney(financialSummary.totalOutstanding)}</p></div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Carruurta (Children)</h2>
        <table className="table-base">
          <thead><tr><th>Arday</th><th>Fasalka</th><th>Meal Plan</th><th className="text-right">Lacagta Bishii</th><th>Xaalada</th></tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="cursor-pointer hover:bg-paper" onClick={() => navigate(`/students/${s.id}`)}>
                <td>{s.fullName}</td>
                <td>{s.class?.name || "-"}</td>
                <td>{s.mealPlan?.name || "Mar-mar oo kaliya"}</td>
                <td className="text-right">{s.mealPlan ? formatMoney(s.mealPlan.monthlyPrice) : "-"}</td>
                <td><span className={`badge ${s.status === "active" ? "badge-paid" : "badge-unpaid"}`}>{s.status === "active" ? "Firfircoon" : "Aan Firfircoonayn"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Taariikhda Lacag Bixinta</h2>
        <table className="table-base">
          <thead><tr><th>Receipt</th><th>Taariikh</th><th>Arday(da)</th><th className="text-right">Lacag</th><th>Habka</th><th></th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.receiptNumber}</td>
                <td>{formatDate(p.paymentDate)}</td>
                <td>{p.allocations.map((a) => `${a.invoice.student.fullName} (${monthLabel(a.invoice.month)} ${a.invoice.year})`).join(", ")}</td>
                <td className="text-right">{formatMoney(p.amount)}</td>
                <td>{p.method}</td>
                <td><button onClick={() => navigate(`/payments/${p.id}/receipt`)} className="text-link text-sm hover:underline">Rasiid</button></td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={6} className="text-center text-ink/40 py-4">Weli lacag lama bixin.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentDetail;
