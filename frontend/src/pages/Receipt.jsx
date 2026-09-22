import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import api from "../api/axios";
import { formatDate, formatMoney, monthLabel } from "../utils/format";

const Receipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    api.get(`/payments/${id}/receipt`).then((res) => setReceipt(res.data.receipt));
  }, [id]);

  if (!receipt) return <p className="text-ink/50">Waa la soo shubayaa...</p>;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-link hover:underline">
          <ArrowLeft size={15} /> Dib u noqo
        </button>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 text-sm"><Printer size={15} /> Print / Save as PDF</button>
      </div>

      <div className="card space-y-4">
        <div className="text-center border-b border-line pb-4">
          <h1 className="font-serif text-xl">Taysiir International Schools</h1>
          <p className="text-sm text-ink/60">School Restaurant Payment Receipt</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-ink/50">Receipt No.</p><p className="font-medium">{receipt.receiptNumber}</p></div>
          <div><p className="text-ink/50">Taariikh</p><p className="font-medium">{formatDate(receipt.paymentDate)}</p></div>
          <div><p className="text-ink/50">Waalid</p><p className="font-medium">{receipt.parent.fullName}</p></div>
          <div><p className="text-ink/50">Habka Lacagta</p><p className="font-medium">{receipt.method}</p></div>
          {receipt.receivedBy && <div><p className="text-ink/50">La Aqbalay</p><p className="font-medium">{receipt.receivedBy.fullName}</p></div>}
          {receipt.reference && <div><p className="text-ink/50">Reference</p><p className="font-medium">{receipt.reference}</p></div>}
        </div>

        <table className="table-base">
          <thead><tr><th>Arday</th><th>Bishii</th><th className="text-right">Lacag</th></tr></thead>
          <tbody>
            {receipt.allocations.map((a) => (
              <tr key={a.id}>
                <td>{a.invoice.student.fullName}</td>
                <td>{monthLabel(a.invoice.month)} {a.invoice.year}</td>
                <td className="text-right">{formatMoney(a.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-line pt-3 flex justify-between text-lg">
          <span>Wadarta</span>
          <strong>{formatMoney(receipt.amount)}</strong>
        </div>
        {receipt.notes && <p className="text-sm text-ink/60">{receipt.notes}</p>}
      </div>
    </div>
  );
};

export default Receipt;
