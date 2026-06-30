"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, LabelBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import { Trash2, Calendar } from "lucide-react";
import { formatDueDate } from "@/lib/utils";
import { TaskWithRelations, UserSummary } from "@/types/board";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function TaskDetailModal({
  task,
  members,
  canEdit,
  onClose,
  onUpdated,
  onDeleted,
}: {
  task: TaskWithRelations | null;
  members: UserSummary[];
  canEdit: boolean;
  onClose: () => void;
  onUpdated: (task: TaskWithRelations) => void;
  onDeleted: (taskId: string) => void;
}) {
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);

  if (!task) return null;

  async function patchTask(payload: Record<string, unknown>, field: string) {
    setSavingField(field);
    const res = await fetch(`/api/tasks/${task!.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSavingField(null);
    if (res.ok) {
      const data = await res.json();
      onUpdated({ ...task!, ...data.task, comments: task!.comments });
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/tasks/${task!.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody }),
    });
    setPosting(false);
    if (res.ok) {
      const data = await res.json();
      onUpdated({ ...task!, comments: [...task!.comments, data.comment] });
      setCommentBody("");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task? This can't be undone.")) return;
    const res = await fetch(`/api/tasks/${task!.id}`, { method: "DELETE" });
    if (res.ok) {
      onDeleted(task!.id);
      onClose();
    }
  }

  return (
    <Modal open={!!task} onClose={onClose} className="max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        {canEdit ? (
          <input
            defaultValue={task.title}
            onBlur={(e) => e.target.value !== task.title && patchTask({ title: e.target.value }, "title")}
            className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none focus:ring-0"
          />
        ) : (
          <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
        )}
        {canEdit && (
          <button
            onClick={handleDelete}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Priority</p>
          {canEdit ? (
            <select
              value={task.priority}
              onChange={(e) => patchTask({ priority: e.target.value }, "priority")}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          ) : (
            <PriorityBadge priority={task.priority} />
          )}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Assignee</p>
          {canEdit ? (
            <select
              value={task.assignee?.id || ""}
              onChange={(e) => patchTask({ assigneeId: e.target.value || null }, "assignee")}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar name={task.assignee?.name} email={task.assignee?.email} image={task.assignee?.image} size="xs" />
              <span className="text-sm text-slate-700">{task.assignee?.name || "Unassigned"}</span>
            </div>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Due date</p>
          {canEdit ? (
            <Input
              type="date"
              defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
              onChange={(e) => patchTask({ dueDate: e.target.value || null }, "dueDate")}
              className="h-9"
            />
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-slate-700">
              <Calendar size={14} /> {formatDueDate(task.dueDate) || "No due date"}
            </span>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-400">Labels</p>
          <div className="flex flex-wrap gap-1.5">
            {task.labels.length === 0 && <span className="text-sm text-slate-400">None</span>}
            {task.labels.map((l) => (
              <LabelBadge key={l} label={l} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-medium text-slate-400">Description</p>
        {canEdit ? (
          <Textarea
            rows={3}
            defaultValue={task.description || ""}
            onBlur={(e) => e.target.value !== task.description && patchTask({ description: e.target.value }, "description")}
            placeholder="Add a description..."
          />
        ) : (
          <p className="text-sm text-slate-600">{task.description || "No description"}</p>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          Comments {task.comments.length > 0 && `(${task.comments.length})`}
        </p>
        <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {task.comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.user.name} email={c.user.email} image={c.user.image} size="sm" />
              <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{c.user.name || c.user.email}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-700">{c.body}</p>
              </div>
            </div>
          ))}
          {task.comments.length === 0 && (
            <p className="text-sm text-slate-400">No comments yet. Start the conversation.</p>
          )}
        </div>
        <form onSubmit={handleComment} className="mt-3 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
          />
          <Button type="submit" loading={posting} size="md">
            Send
          </Button>
        </form>
      </div>
    </Modal>
  );
}
