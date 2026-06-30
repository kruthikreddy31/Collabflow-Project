import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { ROLE_LABELS } from "@/lib/utils";
import { Layers } from "lucide-react";

export default async function WorkspacesPage() {
  const session = await getAuthSession();
  const userId = session!.user.id;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          boards: { select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Workspaces"
        description="Spaces for your team's boards and projects."
        action={<CreateWorkspaceModal />}
      />

      <div className="p-8">
        {memberships.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
              <Layers className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">No workspaces yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first workspace to start organizing boards and inviting teammates.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map(({ workspace, role }) => (
              <Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
                <Card className="h-full p-5 transition-shadow hover:shadow-card">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ background: workspace.color }}
                    >
                      {workspace.name.slice(0, 1).toUpperCase()}
                    </div>
                    <Badge variant="outline">{ROLE_LABELS[role]}</Badge>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{workspace.name}</h3>
                  {workspace.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{workspace.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {workspace.boards.length} board{workspace.boards.length !== 1 && "s"}
                    </span>
                    <div className="flex -space-x-2">
                      {workspace.members.slice(0, 4).map((m) => (
                        <Avatar
                          key={m.id}
                          name={m.user.name}
                          email={m.user.email}
                          image={m.user.image}
                          size="xs"
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
