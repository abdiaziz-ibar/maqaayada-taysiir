import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import parentApi from "../../api/parentAxios";
import { formatDate, mealTypeLabel, attendanceBadgeClass, attendanceStatusLabel } from "../../utils/format";

const ParentPortalChildMeals = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    parentApi.get(`/parent-portal/students/${id}/meals`).then((res) => setData(res.data)).catch((err) => setError(err.response?.data?.message || "Khalad ayaa dhacay."));
  }, [id]);

  if (error) return <p className="min-h-screen flex items-center justify-center text-danger">{error}</p>;
  if (!data) return <p className="min-h-screen flex items-center justify-center text-ink/50">Waa la soo shubayaa...</p>;

  const { student, attendances } = data;

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-navy-dark px-6 py-5 flex items-center gap-3">
        <button onClick={() => navigate("/portal/dashboard")} className="text-white/80 hover:text-white"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-serif text-lg text-white leading-tight">{student.fullName}</h1>
          <p className="text-white/50 text-xs mt-0.5">Taariikhda Cuntada</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Taariikh</th><th>Nooca</th><th>Xaalada</th></tr></thead>
            <tbody>
              {attendances.map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.date)}</td>
                  <td className="capitalize">{mealTypeLabel(a.mealType)}</td>
                  <td><span className={attendanceBadgeClass(a.status)}>{attendanceStatusLabel(a.status)}</span></td>
                </tr>
              ))}
              {attendances.length === 0 && <tr><td colSpan={3} className="text-center text-ink/40 py-6">Weli xog cunto lama diiwaan gelin.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ParentPortalChildMeals;
