import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import { monthLabel } from "../utils/format";

const Calendar = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    api.get("/holidays").then((res) => setHolidays(res.data.holidays));
  }, []);

  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = (firstDay.getUTCDay() + 6) % 7; // Monday = 0

  const holidayOn = (day) => {
    const d = new Date(Date.UTC(year, month - 1, day));
    return holidays.find((h) => new Date(h.startDate) <= d && d <= new Date(h.endDate));
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setMonth(m); setYear(y);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Kalandarka Dugsiga</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => changeMonth(-1)} className="btn-secondary p-2"><ChevronLeft size={16} /></button>
          <span className="font-medium w-32 text-center">{monthLabel(month)} {year}</span>
          <button onClick={() => changeMonth(1)} className="btn-secondary p-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-7 gap-1 text-xs text-ink/50 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="text-center">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const holiday = day ? holidayOn(day) : null;
            return (
              <div key={i} className={`h-16 rounded-md border border-line p-1 text-xs ${holiday ? "bg-danger/10" : ""} ${!day ? "opacity-0" : ""}`}>
                <div className="font-medium">{day}</div>
                {holiday && <div className="text-danger truncate" title={holiday.name}>{holiday.name}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg mb-3">Fasaxyada</h2>
        <ul className="text-sm space-y-1">
          {holidays.map((h) => (
            <li key={h.id} className="flex items-center gap-2">
              <span className="badge bg-danger/10 text-danger capitalize">{h.type}</span>
              <span>{h.name}</span>
              <span className="text-ink/40">({new Date(h.startDate).toLocaleDateString("en-GB")} - {new Date(h.endDate).toLocaleDateString("en-GB")})</span>
            </li>
          ))}
          {holidays.length === 0 && <li className="text-ink/40">Fasax lama helin.</li>}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
