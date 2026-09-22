// Fire-and-forget audit trail. Called at the end of mutating controller
// actions; never awaited by the caller's response path so a logging failure
// can't break the actual operation, but errors are still surfaced to the
// console for visibility.
const logAudit = (prisma, { userId, action, module, recordId, previousValue, newValue }) => {
  prisma.auditLog
    .create({
      data: {
        userId: userId || null,
        action,
        module,
        recordId: recordId || null,
        previousValue: previousValue ?? undefined,
        newValue: newValue ?? undefined,
      },
    })
    .catch((err) => console.error("audit log failed:", err.message));
};

module.exports = { logAudit };
