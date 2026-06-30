import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      boards: true,
    },
  });

  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isMember = workspace.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ workspace });
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requester = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: params.workspaceId } },
  });
  if (!requester || requester.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  const member = await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: params.workspaceId } },
    update: { role: parsed.data.role },
    create: { userId: user.id, workspaceId: params.workspaceId, role: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json({ member }, { status: 201 });
}
