const serializeUser = (user) => {
  const { password, ...rest } = user;
  return { _id: rest.id, ...rest };
};

const serializeParent = (parent) => {
  const { password, ...rest } = parent;
  return { _id: rest.id, ...rest, hasPassword: Boolean(password) };
};

const serializeStudent = (student) => ({ _id: student.id, ...student });

const serializeBill = (bill) => ({ _id: bill.id, ...bill });

// Strips the password hash from a nested Parent relation before it goes out
// over the admin API (studentController/billingController/paymentController
// all `include: { parent: true }`, which otherwise leaks the hash).
const withSafeParent = (record) => {
  if (!record || !record.parent) return record;
  return { ...record, parent: serializeParent(record.parent) };
};

module.exports = { serializeUser, serializeParent, serializeStudent, serializeBill, withSafeParent };
