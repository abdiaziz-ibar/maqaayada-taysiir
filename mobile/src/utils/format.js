export const COLORS = {
  navy: "#1F3A5F",
  navyLight: "#2E5386",
  navyDark: "#152943",
  amber: "#C98A2C",
  brand: "#2F7A4D",
  brandDark: "#1F5934",
  success: "#2F7A4D",
  danger: "#B3402A",
  paper: "#FAFAF9",
  surface: "#FFFFFF",
  ink: "#14181F",
  line: "#E7E5E0",
};

export const formatMoney = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLabel = (m) => MONTHS[m - 1] || m;

export const mealTypeLabel = (t) => ({ breakfast: "Quraac", lunch: "Qado", dinner: "Casho" }[t] || t);

export const invoiceStatusLabel = (s) =>
  ({ paid: "La Bixiyey", partial: "Qeyb Ahaan", unpaid: "Lama Bixin", overdue: "Dhaafay" }[s] || s);
export const invoiceStatusColor = (s) =>
  s === "paid" ? COLORS.success : s === "partial" ? COLORS.amber : COLORS.danger;

export const attendanceStatusLabel = (s) =>
  ({ ate: "Wuu Cunay", did_not_eat: "Ma Cunin", expected: "La Sugayo" }[s] || s);
export const attendanceStatusColor = (s) =>
  s === "ate" ? COLORS.success : s === "did_not_eat" ? COLORS.danger : COLORS.amber;
