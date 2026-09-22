import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatDate, formatMoney, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const Payments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = () => api.get("/payments").then((res) => setPayments(res.data.payments)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Lacag Bixinta</h1>
        <button onClick={() => navigate("/payments/new")} className="btn-primary flex items-center gap-2"><Plus size={16} /> Lacag Cusub</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Receipt</th><th>Taariikh</th><th>Waalid</th><th>Arday(da)</th><th className="text-right">Lacag</th><th>Habka</th><th></th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.receiptNumber}</td>
                <td>{formatDate(p.paymentDate)}</td>
                <td>{p.parent?.fullName || "-"}</td>
                <td>{p.allocations.map((a) => `${a.invoice.student.fullName} (${monthLabel(a.invoice.month)})`).join(", ")}</td>
                <td className="text-right">{formatMoney(p.amount)}</td>
                <td>{p.method}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/payments/${p.id}/receipt`)} className="text-link text-sm hover:underline">Rasiid</button>
                    {user?.role === "admin" && (
                      <button onClick={() => setDeleting(p)} className="text-danger/70 hover:text-danger" title="Baabi'i (Void)"><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && payments.length === 0 && <tr><td colSpan={7} className="text-center text-ink/40 py-6">Weli lacag lama bixin.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/payments/${deleting.id}`); load(); }}
        title="Baabi'i Lacagta (Void)"
        description={deleting ? `Ma hubtaa inaad baabi'inayso lacagta "${deleting.receiptNumber}" ee ${formatMoney(deleting.amount)}? Invoice-yadu waxay dib ugu noqon doonaan xaaladdoodii hore.` : ""}
      />
    </div>
  );
};

export default Payments;
