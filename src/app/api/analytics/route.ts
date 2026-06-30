import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { subDays, format } from "date-fns";

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  const workspaceFilter = workspaceId
    ? { column: { board: { workspaceId } } }
    : { column: { board: { workspace: { members: { some: { userId: session.user.id } } } } } };

  const tasks = await prisma.task.findMany({
    where: workspaceFilter,
    select: {
      id: true,
      priority: true,
      completedAt: true,
      createdAt: true,
      column: { select: { name: true } },
    },
  });

  const byPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));

  const byStatus = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => {
      const status = t.column.name;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  const days = Array.from({ length: 14 }).map((_, i) => subDays(new Date(), 13 - i));
  const completedOverTime = days.map((day) => {
    const key = format(day, "MMM d");
    const count = tasks.filter(
      (t) => t.completedAt && format(new Date(t.completedAt), "MMM d") === key
    ).length;
    return { date: key, completed: count };
  });

  return NextResponse.json({
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.completedAt).length,
    byPriority,
    byStatus,
    completedOverTime,
  });
}
