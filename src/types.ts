export type Priority = 'high' | 'medium' | 'low';

export interface ReminderConfig {
  enabled: boolean;
  offsetMinutes: number; // 0 = at time, 10 = 10m before, 15 = 15m before, etc.
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour format e.g. "09:30")
  durationMinutes: number; // in minutes, e.g. 30, 45, 60
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  reminder?: ReminderConfig;
  order: number;
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other';
}

export type ViewMode = 'daily' | 'weekly';

export type PriorityFilter = 'all' | Priority;
export type StatusFilter = 'all' | 'active' | 'completed';

export interface DayStats {
  total: number;
  completed: number;
  totalMinutes: number;
  completedMinutes: number;
  percentage: number;
}
