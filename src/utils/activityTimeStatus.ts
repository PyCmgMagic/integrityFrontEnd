import { getColumnTimeStatus, type TimeStatus } from './columnTimeStatus';

function parseYyyyMmDdToNumber(dateString: string): number | null {
  const s = dateString.trim();
  // Accept "YYYY-MM-DD" (preferred) and "YYYY/MM/DD" (tolerant).
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mon = Number(m[2]);
  const d = Number(m[3]);
  if (![y, mon, d].every(Number.isFinite)) return null;
  if (mon < 1 || mon > 12) return null;
  if (d < 1 || d > 31) return null;
  return y * 10000 + mon * 100 + d;
}

/**
 * Activity status semantics:
 * - startDate/endDate define an inclusive date range (YYYY-MM-DD)
 * - time-of-day is treated as full day: 00:00:00.000 ~ 23:59:59.999 (Beijing)
 */
export function getActivityTimeStatus(
  nowMs: number,
  range: { startDate: string; endDate: string }
): TimeStatus {
  const startDate = parseYyyyMmDdToNumber(range.startDate);
  const endDate = parseYyyyMmDdToNumber(range.endDate);

  // If backend data is missing/invalid, avoid breaking the UI; default to "in progress".
  if (!startDate || !endDate) return 'in_progress';

  return getColumnTimeStatus(nowMs, { startDate, endDate });
}
