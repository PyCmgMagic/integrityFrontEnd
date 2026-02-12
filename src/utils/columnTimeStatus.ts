import {
  getBeijingDateNumber,
  getBeijingSecondsOfDay,
  parseDateNumberToYmd,
  parseTimeToHms,
  toBeijingDateTimeMs,
} from './beijingTime';

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

export function getColumnTimeStatus(nowMs: number, bounds: ColumnTimeBounds): TimeStatus {
  const startMs = toBeijingDateTimeMs(bounds.startDate, bounds.startTime, 'start');
  const endMs = toBeijingDateTimeMs(bounds.endDate, bounds.endTime, 'end');

  if (nowMs < startMs) return 'not_started';
  if (nowMs > endMs) return 'ended';
  return 'in_progress';
}

export function isWithinDailyPunchWindow(nowMs: number, window: DailyPunchWindow): boolean {
  const today = getBeijingDateNumber(nowMs);

  const startYmd = parseDateNumberToYmd(window.startDate);
  const endYmd = parseDateNumberToYmd(window.endDate);

  // If dates are missing/invalid, don't block check-in.
  if (!startYmd || !endYmd) return true;
  if (window.startDate > window.endDate) return false;
  if (today === null) return true;
  if (today < window.startDate || today > window.endDate) return false;

  const start = parseTimeToHms(window.startTime);
  const end = parseTimeToHms(window.endTime);
  // If time window is missing/invalid, treat as all-day.
  if (!start || !end) return true;

  const nowSec = getBeijingSecondsOfDay(nowMs);
  if (nowSec === null) return true;
  const startSec = start.h * 3600 + start.min * 60 + start.sec;
  const endSec = end.h * 3600 + end.min * 60 + end.sec;

  if (startSec <= endSec) {
    return nowSec >= startSec && nowSec <= endSec;
  }

  // Cross-midnight window (e.g. 22:00-02:00)
  return nowSec >= startSec || nowSec <= endSec;
}
