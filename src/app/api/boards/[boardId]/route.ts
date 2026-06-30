import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      workspace: {
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        },
      },
      columns: {
        orderBy: { order: "asc" },
        include: {
          tasks: {
            orderBy: { order: "asc" },
            include: {
              assignee: { select: { id: true, name: true, email: true, image: true } },
              creator: { select: { id: true, name: true, email: true, image: true } },
              comments: {
                orderBy: { createdAt: "asc" },
                include: { user: { select: { id: true, name: true, email: true, image: true } } },
              },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isMember = board.workspace.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const myRole = board.workspace.members.find((m) => m.userId === session.user.id)?.role;

  return NextResponse.json({ board, myRole });
}
