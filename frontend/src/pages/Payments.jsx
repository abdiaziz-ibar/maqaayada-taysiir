import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatDate, formatMoney, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const billingPeriod = (p) => {
  const periods = p.allocations.map((a) => a.invoice.year * 12 + (a.invoice.month - 1));
  return periods.length ? Math.min(...periods) : Number.MAX_SAFE_INTEGER;
};

const groupByBillingMonth = (payments) => {
  const groups = new Map();
  for (const p of [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))) {
    const key = billingPeriod(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, items]) => ({
      label: key === Number.MAX_SAFE_INTEGER ? "-" : `${monthLabel((key % 12) + 1)} ${Math.floor(key / 12)}`,
      items,
    }));
};

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
            {groupByBillingMonth(payments).map((group) => (
              <Fragment key={group.label}>
              <tr className="bg-paper">
                <td colSpan={7} className="font-semibold text-ink/70">{group.label}</td>
              </tr>
              {group.items.map((p) => (
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
              </Fragment>
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
