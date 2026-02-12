export const BEIJING_TIME_ZONE = 'Asia/Shanghai';
const BEIJING_UTC_OFFSET_HOURS = 8;

export type DateInput = string | number | Date;

export interface BeijingDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const supportsBeijingTimeZone = (() => {
  try {
    new Intl.DateTimeFormat('zh-CN', { timeZone: BEIJING_TIME_ZONE });
    return true;
  } catch {
    return false;
  }
})();

let dateTimePartsFormatter: Intl.DateTimeFormat | null = null;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const pad2 = (value: number) => String(value).padStart(2, '0');

const toDate = (input: DateInput): Date => (input instanceof Date ? input : new Date(input));

const toNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export const getBeijingDateParts = (input: DateInput): BeijingDateParts | null => {
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return null;

  const parts = getDateTimePartsFormatter().formatToParts(date);
  const mapped: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      mapped[part.type] = part.value;
    }
  }

  const year = toNumber(mapped.year);
  const month = toNumber(mapped.month);
  const day = toNumber(mapped.day);
  const hour = toNumber(mapped.hour);
  const minute = toNumber(mapped.minute);
  const second = toNumber(mapped.second);

  if (
    year === null ||
    month === null ||
    day === null ||
    hour === null ||
    minute === null ||
    second === null
  ) {
    return null;
  }

  return { year, month, day, hour, minute, second };
};

const getFormatter = (locale: string, options: Intl.DateTimeFormatOptions) => {
  const key = `${locale}|${supportsBeijingTimeZone ? 'tz' : 'local'}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;

  const formatter = supportsBeijingTimeZone
    ? new Intl.DateTimeFormat(locale, { timeZone: BEIJING_TIME_ZONE, ...options })
    : new Intl.DateTimeFormat(locale, options);
  formatterCache.set(key, formatter);
  return formatter;
};

const getDateTimePartsFormatter = () => {
  if (dateTimePartsFormatter) return dateTimePartsFormatter;
  dateTimePartsFormatter = getFormatter('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return dateTimePartsFormatter;
};

export const formatInBeijing = (
  input: DateInput,
  options: Intl.DateTimeFormatOptions,
  locale = 'zh-CN'
): string => {
  const date = toDate(input);
  if (Number.isNaN(date.getTime())) return '';
  return getFormatter(locale, options).format(date);
};

export const formatBeijingDateYmd = (input: DateInput): string => {
  const parts = getBeijingDateParts(input);
  if (!parts) return '';
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
};

export const formatBeijingDateMd = (input: DateInput): string => {
  const parts = getBeijingDateParts(input);
  if (!parts) return '';
  return `${pad2(parts.month)}-${pad2(parts.day)}`;
};

export const formatBeijingTimeHm = (input: DateInput): string => {
  const parts = getBeijingDateParts(input);
  if (!parts) return '';
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
};

export const getBeijingDateNumber = (input: DateInput): number | null => {
  const parts = getBeijingDateParts(input);
  if (!parts) return null;
  return parts.year * 10000 + parts.month * 100 + parts.day;
};

export const getBeijingSecondsOfDay = (input: DateInput): number | null => {
  const parts = getBeijingDateParts(input);
  if (!parts) return null;
  return parts.hour * 3600 + parts.minute * 60 + parts.second;
};

export const isBeijingToday = (input: DateInput): boolean => {
  const target = getBeijingDateNumber(input);
  const today = getBeijingDateNumber(Date.now());
  if (target === null || today === null) return false;
  return target === today;
};

export const parseYmdToDateNumber = (dateString: string): number | null => {
  const s = dateString.trim();
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mon = Number(m[2]);
  const d = Number(m[3]);
  if (![y, mon, d].every(Number.isFinite)) return null;
  if (mon < 1 || mon > 12) return null;
  if (d < 1 || d > 31) return null;
  return y * 10000 + mon * 100 + d;
};

export const parseDateNumberToYmd = (dateNumber: number): { y: number; m: number; d: number } | null => {
  const s = String(dateNumber);
  if (!/^\d{8}$/.test(s)) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6));
  const d = Number(s.slice(6, 8));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return { y, m, d };
};

export const parseTimeToHms = (time?: string): { h: number; min: number; sec: number } | null => {
  if (!time) return null;
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  if ([h, min, sec].some((n) => !Number.isFinite(n))) return null;
  if (h < 0 || h > 23 || min < 0 || min > 59 || sec < 0 || sec > 59) return null;
  return { h, min, sec };
};

export const toBeijingDateTimeMs = (
  dateNumber: number,
  time: string | undefined,
  kind: 'start' | 'end'
): number => {
  const ymd = parseDateNumberToYmd(dateNumber);
  if (!ymd) return Date.now();

  const hms = parseTimeToHms(time);
  const h = hms?.h ?? (kind === 'start' ? 0 : 23);
  const min = hms?.min ?? (kind === 'start' ? 0 : 59);
  const sec = hms?.sec ?? (kind === 'start' ? 0 : 59);
  const ms = kind === 'end' ? 999 : 0;

  return Date.UTC(ymd.y, ymd.m - 1, ymd.d, h - BEIJING_UTC_OFFSET_HOURS, min, sec, ms);
};

export const getBeijingStartOfDayMs = (input: DateInput): number | null => {
  const dateNumber = getBeijingDateNumber(input);
  if (dateNumber === null) return null;
  return toBeijingDateTimeMs(dateNumber, undefined, 'start');
};
