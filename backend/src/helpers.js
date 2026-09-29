function timestampValue(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  const n = Date.parse(v);
  return Number.isNaN(n) ? 0 : n;
}
function money(n) { return Math.floor(Number(n) || 0); }
function safeText(v, max=1000) { return String(v ?? '').trim().slice(0,max); }
module.exports = { timestampValue, money, safeText };
