import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, Wallet, AlertCircle, UtensilsCrossed, UserRound, CreditCard, CalendarPlus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../api/axios";
import { formatMoney } from "../utils/format";

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={16} className={iconColor} />
      </span>
    </div>
    <p className="text-2xl font-serif">{value}</p>
  </div>
);

const QuickAction = ({ label, icon: Icon, onClick }) => (
  <button onClick={onClick} className="btn-secondary flex items-center gap-2 text-sm">
    <Icon size={15} /> {label}
  </button>
);

const COLORS = ["#2F7A4D", "#B3402A", "#C98A2C"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-ink/50">Waa la soo shubayaa...</p>;

  const attendancePie = [
    { name: "Wuu Cunay", value: data.todayMeals.ate },
    { name: "Ma Cunin", value: data.todayMeals.didNotEat },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <QuickAction label="Arday Cusub" icon={GraduationCap} onClick={() => navigate("/students")} />
          <QuickAction label="Waalid Cusub" icon={Users} onClick={() => navigate("/parents")} />
          <QuickAction label="Diiwaan Geli Cunto" icon={UtensilsCrossed} onClick={() => navigate("/attendance")} />
          <QuickAction label="Cunto Mar-mar ah" icon={UserRound} onClick={() => navigate("/occasional-meals")} />
          <QuickAction label="Lacag Cusub" icon={CreditCard} onClick={() => navigate("/payments")} />
          <QuickAction label="Fasax Cusub" icon={CalendarPlus} onClick={() => navigate("/calendar")} />
        </div>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">Ardayda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Wadarta Ardayda" value={data.students.total} icon={GraduationCap} iconBg="bg-navy/10" iconColor="text-navy" />
          <StatCard label="Firfircoon" value={data.students.active} icon={GraduationCap} iconBg="bg-success/10" iconColor="text-success" />
          <StatCard label="Diiwaan Gashan Meal Plan" value={data.students.mealPlanEnrolled} icon={Users} iconBg="bg-amber/10" iconColor="text-amber" />
          <StatCard label="Mar-mar Cunta (30 maalmood)" value={data.students.occasionalLast30Days} icon={UserRound} iconBg="bg-navy/10" iconColor="text-navy" />
        </div>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">Cuntada Maanta</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:col-span-2">
            <StatCard label="La Sugayo" value={data.todayMeals.expected} icon={UtensilsCrossed} iconBg="bg-navy/10" iconColor="text-navy" />
            <StatCard label="Wuu Cunay" value={data.todayMeals.ate} icon={UtensilsCrossed} iconBg="bg-success/10" iconColor="text-success" />
            <StatCard label="Ma Cunin" value={data.todayMeals.didNotEat} icon={UtensilsCrossed} iconBg="bg-danger/10" iconColor="text-danger" />
          </div>
          <div className="card flex flex-col items-center">
            <p className="text-xs text-ink/50 mb-1">Boqolkiiba Cunidda</p>
            {data.todayMeals.expected > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={attendancePie} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55}>
                    {attendancePie.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ink/40 text-sm py-8">Weli xog lama diiwaan gelin maanta.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">Maaliyadda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Lacagta Maanta" value={formatMoney(data.financial.todaysPayments)} icon={Wallet} iconBg="bg-success/10" iconColor="text-success" />
          <StatCard label="Lacagta Bishaan" value={formatMoney(data.financial.monthPayments)} icon={Wallet} iconBg="bg-success/10" iconColor="text-success" />
          <StatCard label="La Filayo Bishaan" value={formatMoney(data.financial.monthRevenueExpected)} icon={Wallet} iconBg="bg-navy/10" iconColor="text-navy" />
          <StatCard label="La Sugayo (Outstanding)" value={formatMoney(data.financial.outstanding)} icon={AlertCircle} iconBg="bg-danger/10" iconColor="text-danger" />
          <StatCard label="Waalid Aan Bixin" value={data.financial.unpaidParents} icon={Users} iconBg="bg-danger/10" iconColor="text-danger" />
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg mb-3">Menu-ga Maanta</h2>
        {data.restaurant.todayMenus.length === 0 && <p className="text-ink/40 text-sm">Weli menu lama dhigin maanta.</p>}
        <div className="space-y-2">
          {data.restaurant.todayMenus.map((m) => (
            <div key={m.mealType} className="flex items-center gap-3 text-sm">
              <span className="badge bg-navy/10 text-navy capitalize">{m.mealType}</span>
              <span className="text-ink/70">{m.foods.join(", ") || "Weli cunto lama darin."}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
