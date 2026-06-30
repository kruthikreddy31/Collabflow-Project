import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BoardView } from "@/components/board/board-view";

export default async function BoardPage({
  params,
}: {
  params: { workspaceId: string; boardId: string };
}) {
  const session = await getAuthSession();
  const userId = session!.user.id;

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
            },
          },
        },
      },
    },
  });

  if (!board || board.workspaceId !== params.workspaceId) notFound();

  const myMembership = board.workspace.members.find((m) => m.userId === userId);
  if (!myMembership) redirect("/workspaces");

  const members = board.workspace.members.map((m) => m.user);

  // Serialize dates to strings for client components
  const serializedBoard = JSON.parse(JSON.stringify(board));

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
        <div>
          <Link
            href={`/workspaces/${params.workspaceId}`}
            className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft size={14} /> {board.workspace.name}
          </Link>
          <h1 className="text-xl font-bold text-slate-900">{board.name}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BoardView board={serializedBoard} members={members} myRole={myMembership.role} />
      </div>
    </div>
  );
}
