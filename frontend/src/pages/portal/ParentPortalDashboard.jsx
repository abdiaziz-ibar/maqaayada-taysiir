import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, GraduationCap, UtensilsCrossed } from "lucide-react";
import parentApi from "../../api/parentAxios";
import { formatMoney, statusBadgeClass, statusLabel, monthLabel } from "../../utils/format";
import ChangePasswordModal from "./ChangePasswordModal";

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, accent }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </span>
    </div>
    <p className={`text-2xl font-serif ${accent || ""}`}>{value}</p>
  </div>
);

const ParentPortalDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    parentApi.get("/parent-portal/me").then((res) => setData(res.data)).catch((err) => setError(err.response?.data?.message || "Khalad ayaa dhacay."));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("parentToken");
    localStorage.removeItem("parent");
    navigate("/login?as=parent");
  };

  if (error) return <p className="min-h-screen flex items-center justify-center text-danger">{error}</p>;
  if (!data) return <p className="min-h-screen flex items-center justify-center text-ink/50">Waa la soo shubayaa...</p>;

  const { parent, students, totalOwed } = data;

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy-dark px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-serif font-bold text-sm shrink-0 shadow-sm">TS</div>
          <div>
            <h1 className="font-serif text-lg text-white leading-tight">Taysiir International Schools</h1>
            <p className="text-white/50 text-xs mt-0.5">Xisaabta Waalidka — Maqaayda</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/portal/payments")} className="text-sm text-white/80 border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 hover:text-white transition-colors">
            Taariikhda Lacagta
          </button>
          <button onClick={() => setShowPassword(true)} className="text-sm text-white/80 border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 hover:text-white transition-colors">
            Beddel Password
          </button>
          <button onClick={handleLogout} className="text-sm text-white/80 border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 hover:text-white transition-colors">
            Ka Bax
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="card bg-gradient-to-br from-navy to-navy-light text-white border-0">
          <p className="text-white/60 text-sm">Salaan,</p>
          <h2 className="font-serif text-2xl">{parent.fullName}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label="Ardayda Aad Masuul Ka Tahay" value={students.length} icon={GraduationCap} iconBg="bg-navy/10" iconColor="text-navy" />
          <StatCard label="Wadarta Lacagta La Sugayo" value={formatMoney(totalOwed)} accent="text-danger" icon={Wallet} iconBg="bg-danger/10" iconColor="text-danger" />
        </div>

        <div className="space-y-4">
          {students.map((s) => {
            const owedForStudent = s.invoices.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);
            return (
              <div key={s.id} className="card">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <h3 className="font-serif text-lg">{s.fullName}</h3>
                    <p className="text-xs text-ink/50">{s.studentCode} {s.class ? `· ${s.class.name}` : ""} {s.mealPlan ? `· ${s.mealPlan.name}` : "· Mar-mar oo kaliya"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-ink/60">Ku Dhiman: <strong className={owedForStudent > 0 ? "text-danger" : "text-success"}>{formatMoney(owedForStudent)}</strong></span>
                    <button onClick={() => navigate(`/portal/students/${s.id}/meals`)} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3">
                      <UtensilsCrossed size={14} /> Cuntadiisa
                    </button>
                  </div>
                </div>
                <table className="table-base">
                  <thead><tr><th>Bishii</th><th className="text-right">Lacagta</th><th className="text-right">La Bixiyey</th><th className="text-right">Ku Dhiman</th><th>Xaalada</th></tr></thead>
                  <tbody>
                    {s.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{monthLabel(inv.month)} {inv.year}</td>
                        <td className="text-right">{formatMoney(inv.amountDue)}</td>
                        <td className="text-right">{formatMoney(inv.amountPaid)}</td>
                        <td className="text-right">{formatMoney(inv.amountDue - inv.amountPaid)}</td>
                        <td><span className={statusBadgeClass(inv.status)}>{statusLabel(inv.status)}</span></td>
                      </tr>
                    ))}
                    {s.invoices.length === 0 && <tr><td colSpan={5} className="text-center text-ink/40 py-3">Weli invoice lama dhigin.</td></tr>}
                  </tbody>
                </table>
              </div>
            );
          })}
          {students.length === 0 && <div className="card text-center text-ink/40 py-6">Weli arday lagula xidhiidhin xisaabtaan.</div>}
        </div>
      </main>

      <ChangePasswordModal open={showPassword} onClose={() => setShowPassword(false)} />
    </div>
  );
};

export default ParentPortalDashboard;
