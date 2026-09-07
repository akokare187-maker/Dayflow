/**
 * Notification and reminder sound utilities for DayFlow
 */
import { Task } from '../types';
import { getTodayDateKey } from './dateUtils';

// Soft, pleasant acoustic bell tone synthesized via Web Audio API
export function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // AudioContext might be restricted until user interaction, ignore safely
    console.debug('Audio context not ready or disabled:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
  } catch (e) {
    console.debug('Notification request permission error:', e);
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string) {
  playChimeSound();
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'dayflow-reminder',
      });
    } catch (e) {
      console.debug('Failed to display browser notification:', e);
    }
  }
}

// Check which tasks need a reminder triggered now
export function checkDueReminders(tasks: Task[], notifiedTaskIds: Set<string>): { dueTasks: Task[]; updatedNotified: Set<string> } {
  const now = new Date();
  const currentToday = getTodayDateKey();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const dueTasks: Task[] = [];
  const updatedNotified = new Set(notifiedTaskIds);

  tasks.forEach((task) => {
    if (task.completed || !task.reminder?.enabled || !task.startTime || task.date !== currentToday) {
      return;
    }

    const [hours, minutes] = task.startTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const taskMinutes = hours * 60 + minutes;
    const reminderTime = taskMinutes - (task.reminder.offsetMinutes || 0);

    // Trigger if within the window of reminderTime <= currentMinutes <= reminderTime + 2
    if (currentMinutes >= reminderTime && currentMinutes <= reminderTime + 2) {
      const key = `${task.id}-${task.date}-${task.startTime}`;
      if (!updatedNotified.has(key)) {
        updatedNotified.add(key);
        dueTasks.push(task);
      }
    }
  });

  return { dueTasks, updatedNotified };
}
