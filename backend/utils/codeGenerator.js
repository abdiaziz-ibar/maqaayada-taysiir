// Generates the next display code for a model, e.g. "P001", "S007".
// Reads the highest existing numeric suffix rather than a running counter,
// so it stays correct even if a record is ever deleted.
const nextCode = async (prisma, model, field, prefix) => {
  const last = await prisma[model].findFirst({
    where: { [field]: { startsWith: prefix } },
    orderBy: { [field]: "desc" },
  });
  const lastNumber = last ? parseInt(last[field].slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};

module.exports = { nextCode };
