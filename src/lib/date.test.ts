import { describe, expect, it } from 'vitest';
import { addDays, dayMonthShort, formatDecimal, isFutureDate, isPastDate, isToday, startOfWeek, toISODate, weekDates, weekdayShort } from './date';

describe('date utilities', () => {
  it('round-trips toISODate/parseISODate without shifting the day', () => {
    const iso = '2026-03-05';
    expect(toISODate(new Date(2026, 2, 5))).toBe(iso);
  });

  it('addDays moves forward and backward correctly, including across month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-03-05', 7)).toBe('2026-03-12');
  });

  it('startOfWeek returns the Monday of the week for any weekday', () => {
    expect(startOfWeek('2026-09-21')).toBe('2026-09-21'); // Monday itself
    expect(startOfWeek('2026-09-27')).toBe('2026-09-21'); // Sunday -> same week's Monday
    expect(startOfWeek('2026-09-23')).toBe('2026-09-21'); // Wednesday
  });

  it('weekDates returns exactly 7 dates, Monday through Sunday, containing the given date', () => {
    const week = weekDates('2026-09-23');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-09-21');
    expect(week[6]).toBe('2026-09-27');
    expect(week).toContain('2026-09-23');
  });

  it('weekdayShort and dayMonthShort format as expected', () => {
    expect(weekdayShort('2026-09-21')).toBe('SEG');
    expect(weekdayShort('2026-09-27')).toBe('DOM');
    expect(dayMonthShort('2026-09-05')).toBe('05/09');
  });

  it('isToday/isPastDate/isFutureDate classify relative to the real current date', () => {
    const past = '2000-01-01';
    const future = '2999-01-01';
    expect(isPastDate(past)).toBe(true);
    expect(isFutureDate(past)).toBe(false);
    expect(isFutureDate(future)).toBe(true);
    expect(isToday(past)).toBe(false);
  });

  it('formatDecimal uses a comma as the decimal separator (pt-BR)', () => {
    expect(formatDecimal(113.8)).toBe('113,8');
    expect(formatDecimal(2, 1)).toBe('2,0');
  });
});
