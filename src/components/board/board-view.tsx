"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardColumn } from "@/components/board/column";
import { TaskCard } from "@/components/board/task-card";
import { CreateTaskModal } from "@/components/board/create-task-modal";
import { TaskDetailModal } from "@/components/board/task-detail-modal";
import { usePusherBoard } from "@/hooks/use-pusher-board";
import { BoardWithColumns, TaskWithRelations, UserSummary } from "@/types/board";

export function BoardView({
  board: initialBoard,
  members,
  myRole,
}: {
  board: BoardWithColumns;
  members: UserSummary[];
  myRole: "ADMIN" | "MEMBER" | "VIEWER";
}) {
  const [board, setBoard] = useState(initialBoard);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [createColumnId, setCreateColumnId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const canEdit = myRole !== "VIEWER";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const openTask = useMemo(
    () => board.columns.flatMap((c) => c.tasks).find((t) => t.id === openTaskId) || null,
    [board, openTaskId]
  );

  function findColumnOfTask(taskId: string) {
    return board.columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const task = board.columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const sourceCol = findColumnOfTask(activeId);
    const overIsColumn = board.columns.some((c) => c.id === overId);
    const targetCol = overIsColumn ? board.columns.find((c) => c.id === overId) : findColumnOfTask(overId);
    if (!sourceCol || !targetCol || sourceCol.id === targetCol.id) return;

    setBoard((prev) => {
      const next = structuredClone(prev) as BoardWithColumns;
      const srcCol = next.columns.find((c) => c.id === sourceCol.id)!;
      const tgtCol = next.columns.find((c) => c.id === targetCol.id)!;
      const taskIdx = srcCol.tasks.findIndex((t) => t.id === activeId);
      if (taskIdx === -1) return prev;
      const [moved] = srcCol.tasks.splice(taskIdx, 1);
      moved.columnId = tgtCol.id;
      const overIdx = tgtCol.tasks.findIndex((t) => t.id === overId);
      tgtCol.tasks.splice(overIdx >= 0 ? overIdx : tgtCol.tasks.length, 0, moved);
      return next;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const col = findColumnOfTask(activeId);
    if (!col) return;

    if (activeId !== overId) {
      const overIsColumn = board.columns.some((c) => c.id === overId);
      if (!overIsColumn) {
        const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
        const newIndex = col.tasks.findIndex((t) => t.id === overId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setBoard((prev) => {
            const next = structuredClone(prev) as BoardWithColumns;
            const c = next.columns.find((cc) => cc.id === col.id)!;
            c.tasks = arrayMove(c.tasks, oldIndex, newIndex);
            return next;
          });
        }
      }
    }

    const finalCol = findColumnOfTask(activeId);
    if (!finalCol) return;
    const order = finalCol.tasks.findIndex((t) => t.id === activeId);

    await fetch(`/api/tasks/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: finalCol.id, order }),
    });
  }

  function upsertTaskLocally(task: TaskWithRelations, targetColumnId?: string) {
    setBoard((prev) => {
      const next = structuredClone(prev) as BoardWithColumns;
      // remove from any column
      next.columns.forEach((c) => {
        c.tasks = c.tasks.filter((t) => t.id !== task.id);
      });
      const destCol = next.columns.find((c) => c.id === (targetColumnId || task.columnId));
      if (destCol) destCol.tasks.push(task);
      return next;
    });
  }

  function removeTaskLocally(taskId: string) {
    setBoard((prev) => {
      const next = structuredClone(prev) as BoardWithColumns;
      next.columns.forEach((c) => {
        c.tasks = c.tasks.filter((t) => t.id !== taskId);
      });
      return next;
    });
  }

  usePusherBoard({
    boardId: board.id,
    onTaskCreated: (payload) => upsertTaskLocally(payload.task, payload.columnId),
    onTaskUpdated: (payload) => {
      if (payload.task) upsertTaskLocally(payload.task);
    },
    onTaskMoved: (payload) => {
      if (payload.task) upsertTaskLocally(payload.task, payload.toColumnId);
    },
    onTaskDeleted: (payload) => removeTaskLocally(payload.taskId),
  });

  return (
    <div className="kanban-scroll flex h-full gap-4 overflow-x-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {board.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            canEdit={canEdit}
            onAddTask={setCreateColumnId}
            onTaskClick={setOpenTaskId}
          />
        ))}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={!!createColumnId}
        columnId={createColumnId}
        members={members}
        onClose={() => setCreateColumnId(null)}
        onCreated={(task) => upsertTaskLocally(task, task.columnId)}
      />

      <TaskDetailModal
        task={openTask}
        members={members}
        canEdit={canEdit}
        onClose={() => setOpenTaskId(null)}
        onUpdated={(task) => upsertTaskLocally(task)}
        onDeleted={(taskId) => removeTaskLocally(taskId)}
      />
    </div>
  );
}
