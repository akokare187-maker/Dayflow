import React from 'react';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { DayStats, Task } from '../types';
import { formatDuration } from '../utils/dateUtils';

interface ProgressIndicatorProps {
  stats: DayStats;
  tasks: Task[];
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ stats, tasks }) => {
  const { total, completed, totalMinutes, completedMinutes, percentage } = stats;
  const remainingTasks = total - completed;
  const remainingMinutes = Math.max(0, totalMinutes - completedMinutes);

  // Circumference for circular gauge
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Progress Ring + Headline */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-indigo-600 transition-all duration-500 ease-out"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-800">
              {percentage}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {total === 0
                  ? 'No tasks scheduled'
                  : percentage === 100
                  ? 'Schedule Completed!'
                  : `${completed} of ${total} tasks done`}
              </h3>
              {percentage === 100 && total > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Great job
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {total === 0 ? (
                'Add tasks to structure your day flow.'
              ) : percentage === 100 ? (
                'You hit all your planned goals for this schedule!'
              ) : (
                <span>
                  {remainingTasks} {remainingTasks === 1 ? 'task' : 'tasks'} remaining
                  {remainingMinutes > 0 && ` (${formatDuration(remainingMinutes)} focus time)`}
                  {highPriorityCount > 0 && ` · ${highPriorityCount} high priority`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right stats pill */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Planned: <strong className="text-slate-900">{formatDuration(totalMinutes)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Finished: <strong className="text-slate-900">{formatDuration(completedMinutes)}</strong></span>
          </div>
        </div>
      </div>

      {/* Progress linear strip underneath */}
      {total > 0 && (
        <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};
