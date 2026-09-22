import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";
import { formatMoney, formatDate, statusBadgeClass, statusLabel, monthLabel, attendanceBadgeClass, attendanceStatusLabel, mealTypeLabel } from "../utils/format";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState(null);

  const load = () => {
    api.get(`/students/${id}`).then((res) => setStudent(res.data.student));
    api.get(`/reports/student-meal-history/${id}`).then((res) => setHistory(res.data));
  };

  useEffect(load, [id]);

  if (!student) return <p className="text-ink/50">Waa la soo shubayaa...</p>;

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-link hover:underline">
        <ArrowLeft size={15} /> Dib u noqo
      </button>

      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl">{student.fullName}</h1>
            <p className="text-sm text-ink/50">{student.studentCode} · {student.class?.name || "-"} {student.section ? `(${student.section.name})` : ""} · {student.gender || "-"}</p>
          </div>
          <span className={`badge ${student.status === "active" ? "badge-paid" : "badge-unpaid"}`}>
            {student.status === "active" ? "Firfircoon" : "Aan Firfircoonayn"}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
          <div><p className="text-ink/50">Waalidka</p><p>{student.parent?.fullName} ({student.parent?.phone})</p></div>
          <div><p className="text-ink/50">Meal Plan</p><p>{student.mealPlan?.name || "Mar-mar oo kaliya"}</p></div>
          <div><p className="text-ink/50">Diiwaan Gashanay</p><p>{formatDate(student.enrollmentDate)}</p></div>
          <div><p className="text-ink/50">Dhalashada</p><p>{formatDate(student.dateOfBirth)}</p></div>
        </div>
      </div>

      {history && (
        <div className="card">
          <h2 className="text-lg mb-3">Falanqaynta Cuntada</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-ink/50">La Filayay</p><p className="text-xl font-serif">{history.summary.totalExpected}</p></div>
            <div><p className="text-ink/50">Wuu Cunay</p><p className="text-xl font-serif text-success">{history.summary.totalEaten}</p></div>
            <div><p className="text-ink/50">Ma Cunin</p><p className="text-xl font-serif text-danger">{history.summary.totalMissed}</p></div>
            <div><p className="text-ink/50">Boqolkiiba</p><p className="text-xl font-serif">{history.summary.attendancePercentage}%</p></div>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Invoices</h2>
        <table className="table-base">
          <thead><tr><th>Bishii</th><th className="text-right">La Rabo</th><th className="text-right">La Bixiyey</th><th>Xaalada</th></tr></thead>
          <tbody>
            {student.invoices?.map((inv) => (
              <tr key={inv.id}>
                <td>{monthLabel(inv.month)} {inv.year}</td>
                <td className="text-right">{formatMoney(inv.amountDue)}</td>
                <td className="text-right">{formatMoney(inv.amountPaid)}</td>
                <td><span className={statusBadgeClass(inv.status)}>{statusLabel(inv.status)}</span></td>
              </tr>
            ))}
            {(!student.invoices || student.invoices.length === 0) && (
              <tr><td colSpan={4} className="text-center text-ink/40 py-4">Weli invoice lama dhigin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-lg mb-3">Taariikhda Cuntada</h2>
        <table className="table-base">
          <thead><tr><th>Taariikh</th><th>Nooca</th><th>Xaalada</th></tr></thead>
          <tbody>
            {history?.attendances.map((a) => (
              <tr key={a.id}>
                <td>{formatDate(a.date)}</td>
                <td className="capitalize">{mealTypeLabel(a.mealType)}</td>
                <td><span className={attendanceBadgeClass(a.status)}>{attendanceStatusLabel(a.status)}</span></td>
              </tr>
            ))}
            {history && history.attendances.length === 0 && (
              <tr><td colSpan={3} className="text-center text-ink/40 py-4">Weli xog cunto lama diiwaan gelin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentDetail;
