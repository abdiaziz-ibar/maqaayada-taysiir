import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatMoney, monthLabel } from "../utils/format";

const PaymentNew = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParentId = searchParams.get("parentId") || "";

  const [parentSearch, setParentSearch] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parent, setParent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [allocations, setAllocations] = useState({}); // invoiceId -> amount
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (presetParentId) {
      api.get(`/parents/${presetParentId}`).then((res) => setParent(res.data.parent));
    }
  }, [presetParentId]);

  useEffect(() => {
    if (!parentSearch.trim() || parent) return;
    const t = setTimeout(() => {
      api.get("/parents", { params: { search: parentSearch } }).then((res) => setParentOptions(res.data.parents));
    }, 250);
    return () => clearTimeout(t);
  }, [parentSearch, parent]);

  useEffect(() => {
    if (!parent) return;
    api.get("/invoices", { params: { parentId: parent.id } }).then((res) => setInvoices(res.data.invoices.filter((i) => i.status !== "paid")));
  }, [parent]);

  const setAllocation = (invoiceId, value) => setAllocations((prev) => ({ ...prev, [invoiceId]: value }));
  const totalAmount = Object.values(allocations).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const allocationList = Object.entries(allocations)
      .filter(([, v]) => Number(v) > 0)
      .map(([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) }));
    if (allocationList.length === 0) return setError("Geli lacag ugu yaraan hal invoice.");
    setSaving(true);
    try {
      const res = await api.post("/payments", {
        parentId: parent.id,
        amount: totalAmount,
        method,
        reference: reference || undefined,
        notes: notes || undefined,
        allocations: allocationList,
      });
      navigate(`/payments/${res.data.payment.id}/receipt`);
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl">Diiwaan Geli Lacag</h1>

      {!parent ? (
        <div className="card space-y-2">
          <label className="label-field">Raadi Waalidka</label>
          <input className="input-field" value={parentSearch} onChange={(e) => setParentSearch(e.target.value)} placeholder="Magaca ama telefoonka..." autoFocus />
          <div className="divide-y divide-line">
            {parentOptions.map((p) => (
              <button key={p._id} onClick={() => setParent(p)} className="block w-full text-left px-2 py-2 hover:bg-paper text-sm">
                {p.fullName} ({p.phone})
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div className="card flex items-center justify-between">
            <span className="font-medium">{parent.fullName} ({parent.phone})</span>
            <button type="button" onClick={() => { setParent(null); setInvoices([]); setAllocations({}); }} className="text-link text-sm hover:underline">Beddel</button>
          </div>

          <div className="card overflow-x-auto">
            <h2 className="text-lg mb-3">Invoice-yada Furan</h2>
            <table className="table-base">
              <thead><tr><th>Arday</th><th>Bishii</th><th className="text-right">Ku Dhiman</th><th className="text-right">Lacagta Bixinta</th></tr></thead>
              <tbody>
                {invoices.map((inv) => {
                  const balance = inv.amountDue - inv.amountPaid;
                  return (
                    <tr key={inv.id}>
                      <td>{inv.student.fullName}</td>
                      <td>{monthLabel(inv.month)} {inv.year}</td>
                      <td className="text-right">{formatMoney(balance)}</td>
                      <td className="text-right">
                        <input
                          type="number" step="0.01" min="0" max={balance}
                          className="input-field !py-1 !w-28 text-right"
                          value={allocations[inv.id] ?? ""}
                          onChange={(e) => setAllocation(inv.id, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && <tr><td colSpan={4} className="text-center text-ink/40 py-4">Ma jiraan invoice furan.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="card space-y-3">
            <div className="flex justify-between text-lg"><span>Wadarta Lacagta</span><strong>{formatMoney(totalAmount)}</strong></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Habka Lacagta</label>
                <select className="input-field" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div><label className="label-field">Reference (ikhtiyaari)</label><input className="input-field" value={reference} onChange={(e) => setReference(e.target.value)} /></div>
            </div>
            <div><label className="label-field">Faahfaahin (ikhtiyaari)</label><input className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <button type="submit" disabled={saving || totalAmount <= 0} className="btn-primary w-full">{saving ? "..." : "Kaydi Lacagta"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentNew;
