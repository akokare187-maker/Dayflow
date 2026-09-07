import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  Bell, 
  GripVertical, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Task, Priority } from '../types';
import { formatTime12h, calculateEndTime, formatDuration } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  showDate?: boolean;
}

export const priorityConfig: Record<
  Priority,
  { label: string; badgeClass: string; borderClass: string; dotClass: string }
> = {
  high: {
    label: 'High Priority',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-l-rose-500',
    dotClass: 'bg-rose-500',
  },
  medium: {
    label: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-l-amber-500',
    dotClass: 'bg-amber-500',
  },
  low: {
    label: 'Low',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-l-slate-400',
    dotClass: 'bg-slate-400',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  showDate,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;
  const endTime = task.startTime ? calculateEndTime(task.startTime, task.durationMinutes) : '';

  return (
    <div
      id={`task-card-${task.id}`}
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver && onDragOver(e, task.id);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop && onDrop(e, task.id)}
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border bg-white shadow-xs transition-all duration-150 ${
        task.completed
          ? 'border-slate-200 bg-slate-50/70 text-slate-400'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800'
      } ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
    >
      {/* Drag handle */}
      {onDragStart && (
        <button
          type="button"
          aria-label="Drag to rearrange task"
          className="mt-0.5 -ml-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
          title="Drag to rearrange"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Completion Checkbox */}
      <button
        id={`task-check-${task.id}`}
        type="button"
        onClick={() => onToggleComplete(task.id)}
        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
          task.completed
            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
            : 'border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/40'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Task Content Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotClass}`} />
            {priorityInfo.label}
          </span>

          {/* Time block */}
          {task.startTime && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-slate-500" />
              {formatTime12h(task.startTime)}
              {endTime && ` - ${formatTime12h(endTime)}`}
              <span className="text-slate-400">({formatDuration(task.durationMinutes)})</span>
            </span>
          )}

          {/* Reminder indicator */}
          {task.reminder?.enabled && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md"
              title={`Reminder set ${task.reminder.offsetMinutes > 0 ? `${task.reminder.offsetMinutes}m before` : 'at start time'}`}
            >
              <Bell className="w-3 h-3 text-indigo-600" />
              {task.reminder.offsetMinutes > 0 ? `${task.reminder.offsetMinutes}m` : 'On time'}
            </span>
          )}

          {showDate && (
            <span className="text-xs text-slate-500 font-medium">
              {task.date}
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4
          className={`text-sm sm:text-base font-semibold leading-snug break-words ${
            task.completed ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p
            className={`mt-1 text-xs sm:text-sm leading-relaxed line-clamp-2 ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-500'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Action buttons: Edit, Delete, Reorder */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        {/* Mobile accessible up/down reorder buttons */}
        {(onMoveUp || onMoveDown) && (
          <div className="hidden sm:flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onMoveUp && (
              <button
                type="button"
                onClick={onMoveUp}
                aria-label="Move task earlier in order"
                title="Move up"
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={onMoveDown}
                aria-label="Move task later in order"
                title="Move down"
                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Edit Button */}
        <button
          id={`task-edit-${task.id}`}
          type="button"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          title="Edit task"
          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Delete Button */}
        <button
          id={`task-delete-${task.id}`}
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          title="Delete task"
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
