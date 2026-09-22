import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import api from "../api/axios";

// Shared step-up confirmation for every destructive action: the admin must
// re-enter their own password before the delete actually fires. Delete
// endpoints are also admin-only on the backend (authorize("admin")); this
// modal is the UX speed bump against a session left open, not the only
// security boundary.
const ConfirmDeleteModal = ({ open, onClose, onConfirm, title, description }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-password", { password });
      await onConfirm();
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-surface rounded-lg p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg flex items-center gap-2 text-danger">
            <AlertTriangle size={18} /> {title || "Tirtir"}
          </h2>
          <button onClick={() => { setPassword(""); setError(""); onClose(); }}><X size={18} /></button>
        </div>
        <p className="text-sm text-ink/60 mb-4">{description || "Ficilkan lama soo celin karo."}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Geli Password-kaaga (Admin) si aad u xaqiijiso</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
          </div>
          <button type="submit" disabled={loading} className="btn-danger w-full">{loading ? "..." : "Xaqiiji oo Tirtir"}</button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
