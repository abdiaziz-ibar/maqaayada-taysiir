import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Settings = () => {
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.canManageFinance;
  const [schoolName, setSchoolName] = useState("");
  const [currency, setCurrency] = useState("");
  const [occasionalMealPrice, setOccasionalMealPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/settings").then((res) => {
      setSchoolName(res.data.settings.schoolName);
      setCurrency(res.data.settings.currency);
      setOccasionalMealPrice(res.data.settings.occasionalMealPrice);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    setSaving(true);
    try {
      await api.put("/settings", { schoolName, currency, occasionalMealPrice: Number(occasionalMealPrice) });
      setMessage("Dejinta waa la kaydiyay.");
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-ink/50">Waa la soo shubayaa...</p>;

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-2xl">Dejinta</h1>
      <div className="card">
        {!canManage && (
          <div className="bg-amber/10 text-amber text-sm rounded-md px-3 py-2 mb-4">
            Kaliya admin ama shaqaale loo ogolaaday ayaa beddeli kara dejinta.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          {message && <div className="bg-success/10 text-success text-sm rounded-md px-3 py-2">{message}</div>}
          <div><label className="label-field">Magaca Dugsiga</label><input className="input-field" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} disabled={!canManage} required /></div>
          <div><label className="label-field">Lambiga Lacagta (currency symbol)</label><input className="input-field" value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={!canManage} required /></div>
          <div><label className="label-field">Qiimaha Cunto Mar-mar ah (hal maalin)</label><input type="number" step="0.01" className="input-field" value={occasionalMealPrice} onChange={(e) => setOccasionalMealPrice(e.target.value)} disabled={!canManage} required /></div>
          {canManage && <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "..." : "Kaydi"}</button>}
        </form>
      </div>
    </div>
  );
};

export default Settings;
