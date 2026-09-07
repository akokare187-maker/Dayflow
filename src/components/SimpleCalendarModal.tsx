import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types';
import { formatDateKey, parseDateKey, getTodayDateKey } from '../utils/dateUtils';

interface SimpleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  tasks: Task[];
}

export const SimpleCalendarModal: React.FC<SimpleCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  tasks,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => parseDateKey(selectedDate));

  if (!isOpen) return null;

  const todayKey = getTodayDateKey();
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(todayKey);
    onClose();
  };

  // Build days grid for this month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dateKey: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    days.push({
      dateKey: formatDateKey(d),
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      dateKey: formatDateKey(d),
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid to 35 or 42
  const totalCells = days.length <= 35 ? 35 : 42;
  const remaining = totalCells - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      dateKey: formatDateKey(d),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  const monthName = currentMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Map task counts per date
  const taskMap = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const cur = taskMap.get(t.date) || { total: 0, completed: 0 };
    cur.total++;
    if (t.completed) cur.completed++;
    taskMap.set(t.date, cur);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Select Date</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calendar"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="font-semibold text-sm text-slate-900">{monthName}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <span key={day} className="text-xs font-semibold text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map(({ dateKey, dayNum, isCurrentMonth }) => {
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;
              const taskInfo = taskMap.get(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    onSelectDate(dateKey);
                    onClose();
                  }}
                  className={`relative flex flex-col items-center justify-center h-10 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                      : isCurrentMonth
                      ? 'text-slate-800 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{dayNum}</span>

                  {/* Task Indicator Dot */}
                  {taskInfo && taskInfo.total > 0 && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected
                          ? 'bg-white'
                          : taskInfo.completed === taskInfo.total
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Complete</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-2" />
            <span>Pending</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
