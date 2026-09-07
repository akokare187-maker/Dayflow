import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Bell, 
  Flag, 
  Tag, 
  AlignLeft,
  Sparkles
} from 'lucide-react';
import { Task, Priority } from '../types';
import { getTodayDateKey, formatTime12h } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'order'> & { id?: string }) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  defaultTime?: string;
}

const DURATION_OPTIONS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
];

const TIME_PRESETS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '19:00'
];

const REMINDER_OFFSETS = [
  { label: 'At start time', value: 0 },
  { label: '5 min before', value: 5 },
  { label: '10 min before', value: 10 },
  { label: '15 min before', value: 15 },
  { label: '30 min before', value: 30 },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultDate,
  defaultTime,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate || getTodayDateKey());
  const [startTime, setStartTime] = useState(defaultTime || '09:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priority, setPriority] = useState<Priority>('medium');
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderOffset, setReminderOffset] = useState(10);
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'learning' | 'other'>('work');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDate(initialTask.date);
      setStartTime(initialTask.startTime || '09:00');
      setDurationMinutes(initialTask.durationMinutes || 30);
      setPriority(initialTask.priority || 'medium');
      setHasReminder(Boolean(initialTask.reminder?.enabled));
      setReminderOffset(initialTask.reminder?.offsetMinutes ?? 10);
      setCategory(initialTask.category || 'work');
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || getTodayDateKey());
      setStartTime(defaultTime || '09:00');
      setDurationMinutes(30);
      setPriority('medium');
      setHasReminder(false);
      setReminderOffset(10);
      setCategory('work');
    }
    setError('');
  }, [initialTask, isOpen, defaultDate, defaultTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      durationMinutes,
      priority,
      completed: initialTask ? initialTask.completed : false,
      completedAt: initialTask?.completedAt,
      reminder: hasReminder ? { enabled: true, offsetMinutes: reminderOffset } : undefined,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {initialTask ? 'Edit Task' : 'New Plan Entry'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialTask ? 'Adjust details and schedule for this task' : 'Schedule a focused block for your day'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Design review with engineering"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  Date
                </span>
              </label>
              <input
                id="task-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Start Time
                </span>
              </label>
              <input
                id="task-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Quick Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Quick Time Presets</span>
              <span className="text-xs text-indigo-600 font-medium">
                {formatTime12h(startTime)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_PRESETS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStartTime(t)}
                  className={`px-2 py-1 text-xs rounded-lg font-medium border transition-colors ${
                    startTime === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {formatTime12h(t)}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDurationMinutes(opt.value)}
                  className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                    durationMinutes === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Priority Label
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'high'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs ring-1 ring-rose-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                High
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'medium'
                    ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  priority === 'low'
                    ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs ring-1 ring-slate-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Low
              </button>
            </div>
          </div>

          {/* Optional Reminders Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className={`w-4 h-4 ${hasReminder ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-800">
                  Optional Reminder
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReminder}
                  onChange={(e) => setHasReminder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {hasReminder && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="block text-[11px] text-slate-500 mb-1.5">
                  When to notify:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REMINDER_OFFSETS.map((offset) => (
                    <button
                      key={offset.value}
                      type="button"
                      onClick={() => setReminderOffset(offset.value)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                        reminderOffset === offset.value
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {offset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-slate-400" />
                Notes & Context (Optional)
              </span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key deliverables, meeting link, or action items..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="task-save-btn"
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
            >
              {initialTask ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
