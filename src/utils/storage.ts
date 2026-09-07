import { Task, DayStats } from '../types';
import { getTodayDateKey, formatDateKey } from './dateUtils';

const STORAGE_KEY = 'dayflow_tasks_v1';

export function getInitialSeedTasks(): Task[] {
  const today = getTodayDateKey();
  
  // Also create a few for tomorrow and yesterday for weekly view richness
  const todayDate = new Date();
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateKey(tomorrowDate);

  const dayAfterTomorrow = new Date(todayDate);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const nextDay = formatDateKey(dayAfterTomorrow);

  return [
    {
      id: 'task-1',
      title: 'Morning review & prioritize daily flow',
      description: 'Review calendar, align on top 3 strategic priorities for the day.',
      date: today,
      startTime: '08:30',
      durationMinutes: 30,
      priority: 'high',
      completed: true,
      completedAt: new Date().toISOString(),
      reminder: { enabled: true, offsetMinutes: 10 },
      order: 0,
      category: 'work',
    },
    {
      id: 'task-2',
      title: 'Deep Work: Product design sprints & wireframes',
      description: 'Refine interaction states and layout polish for new feature roadmap.',
      date: today,
      startTime: '09:30',
      durationMinutes: 90,
      priority: 'high',
      completed: true,
      completedAt: new Date().toISOString(),
      reminder: { enabled: true, offsetMinutes: 15 },
      order: 1,
      category: 'work',
    },
    {
      id: 'task-3',
      title: 'Quick team check-in & blocker sync',
      description: '15-minute standup with design and engineering leads.',
      date: today,
      startTime: '11:30',
      durationMinutes: 30,
      priority: 'medium',
      completed: false,
      reminder: { enabled: true, offsetMinutes: 5 },
      order: 2,
      category: 'work',
    },
    {
      id: 'task-4',
      title: 'Healthy lunch & 20-min recharge walk',
      description: 'Step outside away from screens for fresh air and sunlight.',
      date: today,
      startTime: '12:30',
      durationMinutes: 60,
      priority: 'low',
      completed: false,
      reminder: { enabled: false, offsetMinutes: 0 },
      order: 3,
      category: 'health',
    },
    {
      id: 'task-5',
      title: 'Review user feedback & iterate roadmap',
      description: 'Go through usability feedback and document key fixes.',
      date: today,
      startTime: '14:00',
      durationMinutes: 60,
      priority: 'medium',
      completed: false,
      reminder: { enabled: true, offsetMinutes: 10 },
      order: 4,
      category: 'work',
    },
    {
      id: 'task-6',
      title: 'Evening workout & mobility stretch',
      description: 'Core training + lower body mobility.',
      date: today,
      startTime: '17:30',
      durationMinutes: 45,
      priority: 'high',
      completed: false,
      reminder: { enabled: true, offsetMinutes: 15 },
      order: 5,
      category: 'health',
    },
    // Yesterday tasks
    {
      id: 'task-y1',
      title: 'Weekly planning & goal kickoff',
      description: 'Mapped milestones for the upcoming sprint.',
      date: yesterday,
      startTime: '09:00',
      durationMinutes: 60,
      priority: 'high',
      completed: true,
      completedAt: yesterdayDate.toISOString(),
      order: 0,
      category: 'work',
    },
    {
      id: 'task-y2',
      title: 'Client presentation & walkthrough',
      description: 'Presented prototype and gathered key feedback.',
      date: yesterday,
      startTime: '13:00',
      durationMinutes: 60,
      priority: 'high',
      completed: true,
      completedAt: yesterdayDate.toISOString(),
      order: 1,
      category: 'work',
    },
    // Tomorrow tasks
    {
      id: 'task-t1',
      title: 'Architecture review & code refactor',
      description: 'Analyze performance bottlenecks and simplify components.',
      date: tomorrow,
      startTime: '10:00',
      durationMinutes: 90,
      priority: 'high',
      completed: false,
      reminder: { enabled: true, offsetMinutes: 15 },
      order: 0,
      category: 'work',
    },
    {
      id: 'task-t2',
      title: 'Coffee chat with mentor',
      description: 'Discuss career growth and strategic leadership ideas.',
      date: tomorrow,
      startTime: '15:00',
      durationMinutes: 45,
      priority: 'medium',
      completed: false,
      reminder: { enabled: true, offsetMinutes: 10 },
      order: 1,
      category: 'personal',
    },
    // Day after tomorrow
    {
      id: 'task-d1',
      title: 'Weekly wrap-up & retrospectives',
      description: 'Review accomplishments, log learnings, and clean workspace.',
      date: nextDay,
      startTime: '16:00',
      durationMinutes: 60,
      priority: 'medium',
      completed: false,
      order: 0,
      category: 'work',
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedTasks();
      saveTasksToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialSeedTasks();
    saveTasksToStorage(initial);
    return initial;
  } catch (err) {
    console.error('Failed to parse tasks from localStorage', err);
    return getInitialSeedTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function calculateDayStats(tasks: Task[], dateKey: string): DayStats {
  const dayTasks = tasks.filter((t) => t.date === dateKey);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.completed).length;
  const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.durationMinutes || 30), 0);
  const completedMinutes = dayTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + (t.durationMinutes || 30), 0);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    totalMinutes,
    completedMinutes,
    percentage,
  };
}
