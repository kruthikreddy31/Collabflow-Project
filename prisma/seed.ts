import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@collabflow.dev" },
    update: {},
    create: { name: "Alice Chen", email: "alice@collabflow.dev", password },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@collabflow.dev" },
    update: {},
    create: { name: "Bob Diaz", email: "bob@collabflow.dev", password },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Product Team",
      slug: "product-team-demo",
      description: "Demo workspace seeded for local development",
      color: "#6366f1",
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
      boards: {
        create: {
          name: "Q3 Roadmap",
          columns: {
            create: [
              { name: "To Do", order: 0 },
              { name: "In Progress", order: 1 },
              { name: "In Review", order: 2 },
              { name: "Done", order: 3 },
            ],
          },
        },
      },
    },
    include: { boards: { include: { columns: true } } },
  });

  const columns = workspace.boards[0].columns;

  await prisma.task.createMany({
    data: [
      {
        title: "Design new onboarding flow",
        priority: "HIGH",
        columnId: columns[0].id,
        assigneeId: alice.id,
        creatorId: alice.id,
        labels: ["design"],
        order: 0,
      },
      {
        title: "Set up Pusher real-time events",
        priority: "URGENT",
        columnId: columns[1].id,
        assigneeId: bob.id,
        creatorId: alice.id,
        labels: ["backend"],
        order: 0,
      },
      {
        title: "Write analytics queries",
        priority: "MEDIUM",
        columnId: columns[2].id,
        assigneeId: alice.id,
        creatorId: bob.id,
        labels: ["backend", "analytics"],
        order: 0,
      },
      {
        title: "Ship marketing site",
        priority: "LOW",
        columnId: columns[3].id,
        assigneeId: bob.id,
        creatorId: bob.id,
        labels: ["marketing"],
        order: 0,
        completedAt: new Date(),
      },
    ],
  });

  console.log("Seed complete. Demo login: alice@collabflow.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
