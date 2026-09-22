export const formatMoney = (amount) => {
  const n = Number(amount || 0);
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const statusLabel = (status) => {
  const map = { paid: "La Bixiyey (Paid)", partial: "Qayb Laga Bixiyey (Partial)", unpaid: "Lama Bixin (Unpaid)" };
  return map[status] || status;
};

export const statusBadgeClass = (status) => {
  const map = { paid: "badge-paid", partial: "badge-partial", unpaid: "badge-unpaid" };
  return `badge ${map[status] || ""}`;
};

export const monthLabel = (month) => {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[month - 1] || month;
};

export const mealTypeLabel = (mealType) => {
  const map = { breakfast: "Quraac", lunch: "Qado", dinner: "Casho", other: "Kale" };
  return map[mealType] || mealType;
};

export const attendanceStatusLabel = (status) => {
  const map = { ate: "Wuu Cunay", did_not_eat: "Ma Cunin", expected: "La Sugayo" };
  return map[status] || status;
};

export const attendanceBadgeClass = (status) => {
  const map = { ate: "badge-paid", did_not_eat: "badge-unpaid", expected: "badge-partial" };
  return `badge ${map[status] || ""}`;
};

// Downloads an array of plain objects as a real .xlsx file (client-side,
// via the `xlsx` package) — used by every report/export button.
export const exportToExcel = async (rows, filename) => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
