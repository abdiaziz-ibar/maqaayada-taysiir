// Normalizes a "YYYY-MM-DD" string (or Date) to a UTC-midnight Date, so the
// same calendar day always maps to the same DB value regardless of server
// timezone. Defaults to today when no input is given.
const normalizeDate = (input) => {
  const isoDay = input ? String(input).slice(0, 10) : new Date().toISOString().slice(0, 10);
  return new Date(`${isoDay}T00:00:00.000Z`);
};

module.exports = { normalizeDate };
