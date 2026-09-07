/**
 * Date and time helper utilities for DayFlow
 */

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getTodayDateKey(): string {
  return formatDateKey(new Date());
}

export function formatDisplayDate(dateKey: string, options?: { includeDayOfWeek?: boolean; isShort?: boolean }): string {
  const date = parseDateKey(dateKey);
  const todayKey = getTodayDateKey();
  
  if (dateKey === todayKey) {
    return options?.includeDayOfWeek ? `Today, ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Today';
  }

  // Check yesterday and tomorrow
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === formatDateKey(yesterday)) {
    return 'Yesterday';
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === formatDateKey(tomorrow)) {
    return 'Tomorrow';
  }

  if (options?.isShort) {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString(undefined, {
    weekday: options?.includeDayOfWeek !== false ? 'long' : undefined,
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hoursStr, minutesStr] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return time24;
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  return `${hours}:${minutes.padStart(2, '0')} ${ampm}`;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return '';
  const [hoursStr, minutesStr] = startTime.split(':');
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return startTime;

  minutes += durationMinutes;
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours = hours % 24;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getWeekDays(referenceDateKey: string): { dateKey: string; date: Date; isToday: boolean }[] {
  const refDate = parseDateKey(referenceDateKey);
  // Get Monday of this week (or Sunday depending on convention, let's start Monday)
  const dayOfWeek = refDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diffToMonday = (dayOfWeek + 6) % 7; // days to subtract to reach Monday
  
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - diffToMonday);

  const todayKey = getTodayDateKey();
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateKey = formatDateKey(d);
    weekDays.push({
      dateKey,
      date: d,
      isToday: dateKey === todayKey,
    });
  }
  return weekDays;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

export function generateHoursList(startHour = 6, endHour = 23): string[] {
  const hours: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}
