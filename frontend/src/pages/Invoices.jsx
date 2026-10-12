import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCcw, Trash2, Pencil, X } from "lucide-react";
import api from "../api/axios";
import { formatMoney, statusBadgeClass, statusLabel, monthLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const EditInvoiceModal = ({ invoice, onClose, onSaved }) => {
  const [amountDue, setAmountDue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (invoice) setAmountDue(String(invoice.amountDue));
    setError("");
  }, [invoice]);

  if (!invoice) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/invoices/${invoice.id}`, { amountDue: Number(amountDue) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Wax Ka Beddel Invoice-ka</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <p className="text-sm text-ink/60 mb-3">{invoice.student.fullName} — {monthLabel(invoice.month)} {invoice.year}</p>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">La Rabo (Qadarka Cusub)</label>
            <input type="number" step="0.01" min="0" className="input-field" value={amountDue} onChange={(e) => setAmountDue(e.target.value)} required />
          </div>
          {invoice.amountPaid > 0 && (
            <p className="text-xs text-ink/50">La Bixiyey horey: {formatMoney(invoice.amountPaid)} — qadarka cusub ma noqon karo mid ka yar tan.</p>
          )}
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "..." : "Kaydi"}</button>
        </form>
      </div>
    </div>
  );
};

const Invoices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageFinance = user?.role === "admin" || user?.canManageFinance;
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [reversing, setReversing] = useState(null);
  const [editing, setEditing] = useState(null);

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
                    {canManageFinance && (
                      <button onClick={() => setEditing(i)} className="text-ink/50 hover:text-ink" title="Wax ka beddel"><Pencil size={15} /></button>
                    )}
                    {canManageFinance && i.amountPaid > 0 && (
                      <button onClick={() => setReversing(i)} className="text-link text-sm hover:underline">Ka noqo bixinta</button>
                    )}
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

      <EditInvoiceModal invoice={editing} onClose={() => setEditing(null)} onSaved={load} />

      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/invoices/${deleting.id}`); load(); }}
        title="Tirtir Invoice-ka"
        description={deleting ? `Ma hubtaa inaad tirtirayso invoice-ka "${deleting.student.fullName}" ee ${monthLabel(deleting.month)} ${deleting.year}?` : ""}
      />
      <ConfirmDeleteModal
        open={!!reversing}
        onClose={() => setReversing(null)}
        onConfirm={async () => { await api.post(`/invoices/${reversing.id}/reverse-payment`); load(); }}
        title="Ka noqo bixinta"
        description={reversing ? `Ma hubtaa inaad ka noqoto lacagta ${reversing.student.fullName} ee ${monthLabel(reversing.month)} ${reversing.year}? Invoice-ka wuxuu noqonayaa "Lama Bixin".` : ""}
      />
    </div>
  );
};

export default Invoices;
