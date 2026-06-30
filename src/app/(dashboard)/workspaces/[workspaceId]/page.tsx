import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CreateBoardButton } from "@/components/workspace/create-board-button";
import { ROLE_LABELS } from "@/lib/utils";
import { KanbanSquare } from "lucide-react";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const session = await getAuthSession();
  const userId = session!.user.id;

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: {
      boards: { include: { _count: { select: { columns: true } } }, orderBy: { createdAt: "asc" } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
    },
  });

  if (!workspace) notFound();

  const myMembership = workspace.members.find((m) => m.userId === userId);
  if (!myMembership) redirect("/workspaces");

  return (
    <div>
      <PageHeader
        title={workspace.name}
        description={workspace.description || "Boards in this workspace"}
        action={
          myMembership.role !== "VIEWER" ? (
            <CreateBoardButton workspaceId={workspace.id} />
          ) : undefined
        }
      />

      <div className="p-8">
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Boards</h2>
          {workspace.boards.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <KanbanSquare className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No boards yet in this workspace.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.boards.map((board) => (
                <Link key={board.id} href={`/workspaces/${workspace.id}/boards/${board.id}`}>
                  <Card className="flex h-full items-center gap-3 p-5 transition-shadow hover:shadow-card">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                      <KanbanSquare className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{board.name}</p>
                      <p className="text-xs text-slate-400">{board._count.columns} columns</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Members</h2>
          <Card className="divide-y divide-slate-100">
            {workspace.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={m.user.name} email={m.user.email} image={m.user.image} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.user.name || m.user.email}</p>
                    <p className="text-xs text-slate-400">{m.user.email}</p>
                  </div>
                </div>
                <Badge variant="outline">{ROLE_LABELS[m.role]}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
