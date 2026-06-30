import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { pusherServer, boardChannel, PusherEvents } from "@/lib/pusher";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  columnId: z.string().optional(),
  order: z.number().optional(),
  completedAt: z.string().nullable().optional(),
});

async function getTaskWithAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      column: { include: { board: { include: { workspace: { include: { members: true } } } } } },
    },
  });
  if (!task) return { task: null, membership: null };
  const membership = task.column.board.workspace.members.find((m) => m.userId === userId);
  return { task, membership };
}

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { task, membership } = await getTaskWithAccess(params.taskId, session.user.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const movedColumn = data.columnId && data.columnId !== task.columnId;

  const updated = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.labels !== undefined && { labels: data.labels }),
      ...(data.columnId !== undefined && { columnId: data.columnId }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.completedAt !== undefined && {
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
      }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      creator: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await prisma.activity.create({
    data: {
      type: movedColumn ? "TASK_MOVED" : "TASK_UPDATED",
      message: movedColumn ? `moved task "${updated.title}"` : `updated task "${updated.title}"`,
      taskId: updated.id,
      userId: session.user.id,
    },
  });

  await pusherServer.trigger(
    boardChannel(task.column.boardId),
    movedColumn ? PusherEvents.TASK_MOVED : PusherEvents.TASK_UPDATED,
    { task: updated, fromColumnId: task.columnId, toColumnId: updated.columnId }
  );

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { task, membership } = await getTaskWithAccess(params.taskId, session.user.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: params.taskId } });

  await pusherServer.trigger(boardChannel(task.column.boardId), PusherEvents.TASK_DELETED, {
    taskId: params.taskId,
    columnId: task.columnId,
  });

  return NextResponse.json({ success: true });
}
