import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { DEFAULT_COLUMNS } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1, "Board name is required"),
  description: z.string().optional(),
});

async function requireMembership(userId: string, workspaceId: string) {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
}

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await requireMembership(session.user.id, params.workspaceId);
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const boards = await prisma.board.findMany({
    where: { workspaceId: params.workspaceId },
    include: { columns: { include: { _count: { select: { tasks: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ boards, role: membership.role });
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await requireMembership(session.user.id, params.workspaceId);
  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const board = await prisma.board.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      workspaceId: params.workspaceId,
      columns: {
        create: DEFAULT_COLUMNS.map((colName, i) => ({ name: colName, order: i })),
      },
    },
    include: { columns: true },
  });

  return NextResponse.json({ board }, { status: 201 });
}
