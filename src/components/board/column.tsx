"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/board/task-card";
import { ColumnWithTasks } from "@/types/board";

export function BoardColumn({
  column,
  onTaskClick,
  onAddTask,
  canEdit,
}: {
  column: ColumnWithTasks;
  onTaskClick: (taskId: string) => void;
  onAddTask: (columnId: string) => void;
  canEdit: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column" } });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/70 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700">{column.name}</h3>
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
            {column.tasks.length}
          </span>
        </div>
        {canEdit && (
          <button
            onClick={() => onAddTask(column.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-primary-600"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[60px] flex-1 flex-col gap-2.5 rounded-xl p-1 transition-colors ${
          isOver ? "bg-primary-50/60 ring-2 ring-primary-200" : ""
        }`}
      >
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>
        {column.tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 py-6 text-xs text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
