"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, GripVertical } from "lucide-react";
import { PriorityBadge, LabelBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDueDate, isOverdue } from "@/lib/utils";
import { TaskWithRelations } from "@/types/board";

export function TaskCard({
  task,
  onClick,
}: {
  task: TaskWithRelations;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = task.dueDate && !task.completedAt && isOverdue(task.dueDate);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-subtle transition-shadow hover:shadow-card",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-slate-900">{task.title}</p>
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 cursor-grab touch-none rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:text-slate-500 group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <LabelBadge key={label} label={label} />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className={cn("text-xs", overdue ? "font-medium text-red-500" : "text-slate-400")}>
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-slate-400">
              <MessageSquare size={12} /> {task.comments.length}
            </span>
          )}
          {task.assignee && (
            <Avatar
              name={task.assignee.name}
              email={task.assignee.email}
              image={task.assignee.image}
              size="xs"
            />
          )}
        </div>
      </div>
    </div>
  );
}
