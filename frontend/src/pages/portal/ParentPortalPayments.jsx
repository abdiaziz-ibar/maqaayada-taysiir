import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import parentApi from "../../api/parentAxios";
import { formatDate, formatMoney, monthLabel } from "../../utils/format";

const ParentPortalPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    parentApi.get("/parent-portal/payments").then((res) => setPayments(res.data.payments));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy-dark px-6 py-5 flex items-center gap-3">
        <button onClick={() => navigate("/portal/dashboard")} className="text-white/80 hover:text-white"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-serif text-lg text-white leading-tight">Taariikhda Lacag Bixinta</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Receipt</th><th>Taariikh</th><th>Arday(da)</th><th className="text-right">Lacag</th><th>Habka</th></tr></thead>
            <tbody>
              {payments?.map((p) => (
                <tr key={p.id}>
                  <td>{p.receiptNumber}</td>
                  <td>{formatDate(p.paymentDate)}</td>
                  <td>{p.allocations.map((a) => `${a.invoice.student.fullName} (${monthLabel(a.invoice.month)})`).join(", ")}</td>
                  <td className="text-right">{formatMoney(p.amount)}</td>
                  <td>{p.method}</td>
                </tr>
              ))}
              {payments && payments.length === 0 && <tr><td colSpan={5} className="text-center text-ink/40 py-6">Weli lacag lama bixin.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ParentPortalPayments;
