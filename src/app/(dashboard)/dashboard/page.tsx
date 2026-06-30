import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { PriorityBadge } from "@/components/ui/badge";
import { Layers, ListChecks, ArrowRight } from "lucide-react";
import { formatDueDate } from "@/lib/utils";

export default async function DashboardHomePage() {
  const session = await getAuthSession();
  const userId = session!.user.id;

  const [workspaceCount, myTasks] = await Promise.all([
    prisma.workspaceMember.count({ where: { userId } }),
    prisma.task.findMany({
      where: { assigneeId: userId, completedAt: null },
      orderBy: { dueDate: "asc" },
      take: 6,
      include: { column: { include: { board: { include: { workspace: true } } } } },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session!.user.name?.split(" ")[0] || "there"} 👋`}
        description="Here's what's happening across your workspaces."
      />

      <div className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Layers className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{workspaceCount}</p>
              <p className="text-sm text-slate-500">Workspaces</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <ListChecks className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{myTasks.length}</p>
              <p className="text-sm text-slate-500">Open tasks assigned to you</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-8 pb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Your upcoming tasks</h2>
          <Link href="/my-tasks" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm text-slate-500">No open tasks assigned to you yet.</p>
            <Link href="/workspaces" className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
              Browse workspaces →
            </Link>
          </Card>
        ) : (
          <Card className="divide-y divide-slate-100">
            {myTasks.map((task) => (
              <Link
                key={task.id}
                href={`/workspaces/${task.column.board.workspaceId}/boards/${task.column.boardId}?task=${task.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {task.column.board.workspace.name} · {task.column.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {task.dueDate && (
                    <span className="text-xs text-slate-400">{formatDueDate(task.dueDate)}</span>
                  )}
                  <PriorityBadge priority={task.priority} />
                </div>
              </Link>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
