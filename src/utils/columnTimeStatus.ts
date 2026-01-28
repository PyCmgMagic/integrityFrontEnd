export type TimeStatus = 'not_started' | 'in_progress' | 'ended';

export interface ColumnTimeBounds {
  startDate: number;
  endDate: number;
  // Optional daily start/end time in "HH:mm" or "HH:mm:ss" format.
  startTime?: string;
  endTime?: string;
}

// Punch window semantics:
// - startDate/endDate define an inclusive date range (YYYYMMDD)
// - startTime/endTime define a daily inclusive time-of-day window (HH:mm or HH:mm:ss)
//   (if the window crosses midnight, treat it as spanning to the next day)
export interface DailyPunchWindow {
  startDate: number;
  endDate: number;
  startTime?: string;
  endTime?: string;
}

function parseYyyyMmDd(dateNumber: number): { y: number; m: number; d: number } | null {
  const s = String(dateNumber);
  if (!/^\d{8}$/.test(s)) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return { y, m, d };
}

function parseHms(time?: string): { h: number; min: number; sec: number } | null {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  if ([h, min, sec].some((n) => !Number.isFinite(n))) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) return null;
  return { h, min, sec };
}

function toYyyyMmDdNumber(d: Date): number {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return y * 10000 + m * 100 + day;
}

function toSecondsOfDay(d: Date): number {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function toLocalDateTimeMs(dateNumber: number, time: string | undefined, kind: 'start' | 'end'): number {
  const ymd = parseYyyyMmDd(dateNumber);
  // If date is invalid, treat as "now" bound to avoid throwing in UI.
  if (!ymd) return Date.now();

  const hms = parseHms(time);
  const h = hms?.h ?? (kind === 'start' ? 0 : 23);
  const min = hms?.min ?? (kind === 'start' ? 0 : 59);
  const sec = hms?.sec ?? (kind === 'start' ? 0 : 59);
  const ms = kind === 'end' ? 999 : 0; // inclusive end boundary

  return new Date(ymd.y, ymd.m - 1, ymd.d, h, min, sec, ms).getTime();
}

export function getColumnTimeStatus(nowMs: number, bounds: ColumnTimeBounds): TimeStatus {
  const startMs = toLocalDateTimeMs(bounds.startDate, bounds.startTime, 'start');
  const endMs = toLocalDateTimeMs(bounds.endDate, bounds.endTime, 'end');

  if (nowMs < startMs) return 'not_started';
  if (nowMs > endMs) return 'ended';
  return 'in_progress';
}

export function isWithinDailyPunchWindow(nowMs: number, window: DailyPunchWindow): boolean {
  const now = new Date(nowMs);
  const today = toYyyyMmDdNumber(now);

  const startYmd = parseYyyyMmDd(window.startDate);
  const endYmd = parseYyyyMmDd(window.endDate);

  // If dates are missing/invalid, don't block check-in.
  if (!startYmd || !endYmd) return true;
  if (window.startDate > window.endDate) return false;
  if (today < window.startDate || today > window.endDate) return false;

  const start = parseHms(window.startTime);
  const end = parseHms(window.endTime);
  // If time window is missing/invalid, treat as all-day.
  if (!start || !end) return true;

  const nowSec = toSecondsOfDay(now);
  const startSec = start.h * 3600 + start.min * 60 + start.sec;
  const endSec = end.h * 3600 + end.min * 60 + end.sec;

  if (startSec <= endSec) {
    return nowSec >= startSec && nowSec <= endSec;
  }

  // Cross-midnight window (e.g. 22:00-02:00)
  return nowSec >= startSec || nowSec <= endSec;
}
