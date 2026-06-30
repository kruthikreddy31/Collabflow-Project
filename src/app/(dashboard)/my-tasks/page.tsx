import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/badge";
import { formatDueDate, isOverdue } from "@/lib/utils";
import { ListChecks } from "lucide-react";

export default async function MyTasksPage() {
  const session = await getAuthSession();
  const userId = session!.user.id;

  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: [{ completedAt: "asc" }, { dueDate: "asc" }],
    include: {
      column: { include: { board: { include: { workspace: true } } } },
    },
  });

  const open = tasks.filter((t) => !t.completedAt);
  const done = tasks.filter((t) => t.completedAt);

  return (
    <div>
      <PageHeader title="My tasks" description="Everything assigned to you, across all workspaces." />

      <div className="space-y-8 p-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Open ({open.length})</h2>
          {open.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <ListChecks className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">You're all caught up.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100">
              {open.map((task) => {
                const overdue = task.dueDate && isOverdue(task.dueDate);
                return (
                  <Link
                    key={task.id}
                    href={`/workspaces/${task.column.board.workspaceId}/boards/${task.column.boardId}?task=${task.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {task.column.board.workspace.name} · {task.column.board.name} · {task.column.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {task.dueDate && (
                        <span className={`text-xs ${overdue ? "font-medium text-red-500" : "text-slate-400"}`}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}
        </section>

        {done.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Completed ({done.length})</h2>
            <Card className="divide-y divide-slate-100">
              {done.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-4 px-5 py-3.5 opacity-60">
                  <p className="truncate text-sm font-medium text-slate-900 line-through">{task.title}</p>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
