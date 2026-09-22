import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCcw, Trash2 } from "lucide-react";
import api from "../api/axios";
import { formatMoney, statusBadgeClass, statusLabel, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/invoices", { params: { year, month, ...(status ? { status } : {}) } }).then((res) => setInvoices(res.data.invoices)).finally(() => setLoading(false));
  };
  useEffect(load, [year, month, status]);

  const generate = async () => {
    setGenerating(true);
    setMessage("");
    try {
      const res = await api.post("/invoices/generate", { year, month });
      setMessage(`${res.data.created} invoice oo cusub ayaa la abuuray (${res.data.skipped} horey ayaa u jiray).`);
      load();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Invoices</h1>
        <div className="flex items-center gap-2">
          <select className="input-field !w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          <input type="number" className="input-field !w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <select className="input-field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Dhammaan</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <button onClick={generate} disabled={generating} className="btn-primary flex items-center gap-2">
            <RefreshCcw size={16} /> {generating ? "..." : "Dhalii Invoices"}
          </button>
        </div>
      </div>
      {message && <div className="bg-success/10 text-success text-sm rounded-md px-3 py-2">{message}</div>}

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Arday</th><th>Waalid</th><th className="text-right">La Rabo</th><th className="text-right">La Bixiyey</th><th className="text-right">Ku Dhiman</th><th>Xaalada</th><th></th></tr></thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td>{i.student.fullName}</td>
                <td>{i.student.parent?.fullName} ({i.student.parent?.phone})</td>
                <td className="text-right">{formatMoney(i.amountDue)}</td>
                <td className="text-right">{formatMoney(i.amountPaid)}</td>
                <td className="text-right">{formatMoney(i.amountDue - i.amountPaid)}</td>
                <td><span className={statusBadgeClass(i.status)}>{statusLabel(i.status)}</span></td>
                <td>
                  <div className="flex items-center gap-3">
                    {i.status !== "paid" && <button onClick={() => navigate(`/payments/new?parentId=${i.student.parentId}`)} className="btn-secondary text-sm py-1.5 px-3">Bixi</button>}
                    {user?.role === "admin" && i.amountPaid === 0 && (
                      <button onClick={() => setDeleting(i)} className="text-danger/70 hover:text-danger" title="Tirtir"><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && invoices.length === 0 && <tr><td colSpan={7} className="text-center text-ink/40 py-6">Invoice lama helin bishaan. Riix "Dhalii Invoices".</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/invoices/${deleting.id}`); load(); }}
        title="Tirtir Invoice-ka"
        description={deleting ? `Ma hubtaa inaad tirtirayso invoice-ka "${deleting.student.fullName}" ee ${monthLabel(deleting.month)} ${deleting.year}?` : ""}
      />
    </div>
  );
};

export default Invoices;
