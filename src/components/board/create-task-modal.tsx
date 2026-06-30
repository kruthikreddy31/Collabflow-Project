"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserSummary } from "@/types/board";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export function CreateTaskModal({
  open,
  columnId,
  members,
  onClose,
  onCreated,
}: {
  open: boolean;
  columnId: string | null;
  members: UserSummary[];
  onClose: () => void;
  onCreated: (task: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [labelsInput, setLabelsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
    setAssigneeId("");
    setLabelsInput("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!columnId) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        columnId,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null,
        labels: labelsInput
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    const data = await res.json();
    onCreated(data.task);
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New task"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
          <Input
            placeholder="Design the onboarding flow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as (typeof PRIORITIES)[number])}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Due date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Labels <span className="text-slate-400">(comma separated)</span>
          </label>
          <Input
            placeholder="design, frontend"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
