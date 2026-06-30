import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { pusherServer, boardChannel, PusherEvents } from "@/lib/pusher";

const createSchema = z.object({ body: z.string().min(1, "Comment cannot be empty") });

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedBody = createSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({
    where: { id: params.taskId },
    include: { column: { include: { board: { include: { workspace: { include: { members: true } } } } } } },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember = task.column.board.workspace.members.some((m) => m.userId === session.user.id);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const comment = await prisma.comment.create({
    data: { body: parsedBody.data.body, taskId: params.taskId, userId: session.user.id },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  await prisma.activity.create({
    data: {
      type: "TASK_COMMENTED",
      message: "commented on this task",
      taskId: params.taskId,
      userId: session.user.id,
    },
  });

  await pusherServer.trigger(boardChannel(task.column.boardId), PusherEvents.TASK_UPDATED, {
    taskId: params.taskId,
    commentAdded: true,
  });

  return NextResponse.json({ comment }, { status: 201 });
}
