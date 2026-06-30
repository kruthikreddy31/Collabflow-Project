import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { slugify, DEFAULT_COLUMNS } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
      boards: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const myMemberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
  });
  const roleMap = Object.fromEntries(myMemberships.map((m) => [m.workspaceId, m.role]));

  return NextResponse.json({
    workspaces: workspaces.map((w) => ({ ...w, myRole: roleMap[w.id] })),
  });
}

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

  const { name, description, color } = parsed.data;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      color: color || "#6366f1",
      slug: slugify(name),
      members: {
        create: { userId: session.user.id, role: "ADMIN" },
      },
      boards: {
        create: {
          name: "Main board",
          columns: {
            create: DEFAULT_COLUMNS.map((colName, i) => ({ name: colName, order: i })),
          },
        },
      },
    },
    include: { boards: true, members: true },
  });

  return NextResponse.json({ workspace }, { status: 201 });
}
