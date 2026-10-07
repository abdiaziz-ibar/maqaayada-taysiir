export const COLORS = {
  navy: "#0E1318",
  navyLight: "#1C2530",
  navyDark: "#07090C",
  amber: "#FF8E28",
  brand: "#FF8E28",
  brandDark: "#E67A12",
  success: "#2F7A4D",
  danger: "#C2412D",
  paper: "#F7F4EF",
  surface: "#FFFFFF",
  ink: "#0E1318",
  line: "#ECE6DD",
};

export const TILE_COLORS = [
  { bg: "#DDF3E4", fg: "#1F7A4D" },
  { bg: "#FFEAD9", fg: "#C2410C" },
  { bg: "#DCEBFB", fg: "#1D4ED8" },
  { bg: "#F1E4FB", fg: "#7C3AED" },
  { bg: "#FCE4E4", fg: "#C2412D" },
  { bg: "#FFF1D6", fg: "#B45309" },
];

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
