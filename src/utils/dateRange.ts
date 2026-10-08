export type IsoRange = { from: string; to: string };
const iso = (date: Date) => date.toISOString().slice(0, 10);
export const utcDate = (day: string) => new Date(day + 'T12:00:00.000Z');
export const isoDay = (year: number, month: number, day: number) => iso(new Date(Date.UTC(year, month, day, 12)));
export const addDays = (day: string, amount: number) => {
  const date = utcDate(day); date.setUTCDate(date.getUTCDate() + amount); return iso(date);
};
export const addMonths = (day: string, amount: number) => {
  const date = utcDate(day);
  return isoDay(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
};
/** Use the business calendar date, not device-local time or a hardcoded demo date. */
export const businessToday = (clock = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(clock);
  const value = (key: string) => parts.find((part) => part.type === key)?.value ?? '';
  return value('year') + '-' + value('month') + '-' + value('day');
};
export const datePreset = (key: string, today = businessToday()): IsoRange => {
  const date = utcDate(today);
  const monthStart = isoDay(date.getUTCFullYear(), date.getUTCMonth(), 1);
  const weekStart = addDays(today, -(date.getUTCDay() + 6) % 7);
  switch (key) {
    case 'Today': return { from: today, to: today };
    case 'Yesterday': { const yesterday = addDays(today, -1); return { from: yesterday, to: yesterday }; }
    case 'Last 7 days': return { from: addDays(today, -6), to: today };
    case 'This week': return { from: weekStart, to: addDays(weekStart, 6) };
    case 'This month': return { from: monthStart, to: addDays(addMonths(monthStart, 1), -1) };
    case 'Last month': { const start = addMonths(monthStart, -1); return { from: start, to: addDays(monthStart, -1) }; }
    default: return { from: '', to: '' };
  }
};
export const formatDay = (date: string) => date
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(utcDate(date)) : 'Select date';
export const formatRange = ({ from, to }: IsoRange) =>
  from && to ? (from === to ? formatDay(from) : formatDay(from) + ' – ' + formatDay(to)) : from ? formatDay(from) + ' – …' : 'All dates';
