// In-memory 3-strike login limiter. Keyed by (scope, identifier) so staff,
// parent, and password-verify attempts are tracked independently.
const MAX_ATTEMPTS = 3;
const LOCK_MS = 5 * 60 * 1000; // 5 minutes

const attempts = new Map();

const key = (scope, id) => `${scope}:${id}`;

const getLockRemaining = (scope, id) => {
  const entry = attempts.get(key(scope, id));
  if (!entry || !entry.lockedUntil) return 0;
  const remaining = entry.lockedUntil - Date.now();
  if (remaining <= 0) {
    attempts.delete(key(scope, id));
    return 0;
  }
  return Math.ceil(remaining / 1000);
};

const failureResult = (scope, id, message) => {
  const k = key(scope, id);
  const entry = attempts.get(k) || { count: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_MS;
    attempts.set(k, entry);
    return { status: 429, message: lockedMessage(Math.ceil(LOCK_MS / 1000)) };
  }
  attempts.set(k, entry);
  return { status: 401, message };
};

const reset = (scope, id) => attempts.delete(key(scope, id));

const lockedMessage = (seconds) =>
  `Isku day badan oo khalad ah. Fadlan sug ${Math.ceil(seconds / 60)} daqiiqo ka hor intaadan mar kale isku dayin.`;

module.exports = { getLockRemaining, failureResult, reset, lockedMessage };
