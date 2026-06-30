import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { pusherServer, boardChannel, PusherEvents } from "@/lib/pusher";

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  columnId: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const column = await prisma.column.findUnique({
    where: { id: parsed.data.columnId },
    include: { board: { include: { workspace: { include: { members: true } } } } },
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const membership = column.board.workspace.members.find((m) => m.userId === session.user.id);
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const lastTask = await prisma.task.findFirst({
    where: { columnId: parsed.data.columnId },
    orderBy: { order: "desc" },
  });

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      columnId: parsed.data.columnId,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assigneeId: parsed.data.assigneeId || null,
      labels: parsed.data.labels || [],
      order: (lastTask?.order ?? -1) + 1,
      creatorId: session.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      creator: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await prisma.activity.create({
    data: {
      type: "TASK_CREATED",
      message: `created task "${task.title}"`,
      taskId: task.id,
      userId: session.user.id,
    },
  });

  await pusherServer.trigger(boardChannel(column.boardId), PusherEvents.TASK_CREATED, {
    task,
    columnId: parsed.data.columnId,
  });

  return NextResponse.json({ task }, { status: 201 });
}
