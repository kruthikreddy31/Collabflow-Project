# CollabFlow

A Trello/Notion-style project management SaaS built with Next.js 14 (App Router), PostgreSQL + Prisma, NextAuth.js, Pusher, @dnd-kit, and Recharts.

## Stack

- **Framework:** Next.js 14, App Router, TypeScript, Tailwind CSS, `src/` directory
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js — Credentials (bcrypt-hashed passwords) + Google OAuth, JWT sessions
- **Real-time:** Pusher Channels
- **Drag-and-drop:** @dnd-kit
- **Charts:** Recharts

## 1. Local setup

```bash
npm install
cp .env.example .env   # fill in the values below
npx prisma db push     # create tables from schema.prisma
npm run db:seed        # optional demo data (alice@collabflow.dev / password123)
npm run dev
```

App runs at `http://localhost:3000`.

## 2. Environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Postgres connection string — see hosting options below |
| `NEXTAUTH_URL` | `http://localhost:3000` locally, your prod URL in production |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Client ID, web application. Authorized redirect URI: `{NEXTAUTH_URL}/api/auth/callback/google` |
| `PUSHER_APP_ID`, `NEXT_PUBLIC_PUSHER_KEY`, `PUSHER_SECRET`, `NEXT_PUBLIC_PUSHER_CLUSTER` | [Pusher dashboard](https://dashboard.pusher.com) → create a Channels app |

## 3. Database hosting (pick one)

- **[Neon](https://neon.tech)** — serverless Postgres, generous free tier, instant branch databases.
- **[Supabase](https://supabase.com)** — Postgres + dashboard, free tier included.
- **[Railway](https://railway.app)** — one-click Postgres plugin, pay-as-you-go.

Copy the connection string into `DATABASE_URL` (use the pooled/`?pgbouncer=true` connection string if offered, for serverless compatibility), then run `npx prisma db push` (or `npx prisma migrate deploy` once you have migrations).

## 4. Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://collabflow.vercel.app`).
5. Add that same URL's `/api/auth/callback/google` as an authorized redirect URI in your Google OAuth client.
6. Deploy. The `postinstall` script runs `prisma generate` automatically; `npm run build` also runs `prisma generate` before `next build`.
7. After the first deploy, run `npx prisma db push` locally (pointed at the prod `DATABASE_URL`) or set up a migration step to create tables in your production database.

## 5. Project structure

```
src/
  app/
    (auth)/login, (auth)/signup        — auth pages, centered card on gradient bg
    (dashboard)/dashboard              — home/overview
    (dashboard)/workspaces             — workspace list + detail + boards
    (dashboard)/my-tasks               — tasks assigned to current user
    (dashboard)/analytics              — Recharts dashboards
    api/register                       — POST create user (bcrypt hash)
    api/auth/[...nextauth]             — NextAuth handler
    api/workspaces                     — GET list / POST create
    api/workspaces/[workspaceId]/boards — GET list / POST create board
    api/workspaces/[workspaceId]       — GET workspace detail / POST invite member
    api/boards/[boardId]               — GET full board (columns/tasks/assignees/comments)
    api/tasks                          — POST create task
    api/tasks/[taskId]                 — PATCH update / DELETE
    api/tasks/[taskId]/comments        — POST add comment
    api/analytics                      — aggregate stats for charts
  components/
    ui/        — Avatar, Badge, Button, Input, Card, Modal, Spinner
    board/      — Kanban column, task card, create/detail modals, DnD board view
    layout/     — Sidebar, PageHeader
    workspace/  — create workspace/board modals
    analytics/  — Recharts dashboard
  lib/
    prisma.ts   — Prisma client singleton
    auth.ts     — NextAuth config (Credentials + Google, JWT sessions)
    pusher.ts   — server + client Pusher instances, channel/event names
    utils.ts    — cn, slugify, getInitials, priority color maps
  hooks/
    use-pusher-board.ts — subscribes a board page to live task events
prisma/
  schema.prisma — full data model (User, Workspace, WorkspaceMember, Board, Column, Task, Comment, Activity)
  seed.ts        — demo data
```

## 6. Role-based access control

Each `WorkspaceMember` has a `Role`: `ADMIN`, `MEMBER`, or `VIEWER`.
- **Admins** can invite members, create boards, and edit/delete everything.
- **Members** can create/edit/move tasks and comment, but can't manage workspace membership.
- **Viewers** have read-only access — task creation, editing, and dragging are disabled in the UI and rejected server-side in the API routes.

## 7. Real-time sync

Every board subscribes to a Pusher channel (`board-{boardId}`). Task create/update/move/delete API routes trigger events on that channel; the `usePusherBoard` hook updates local state for every connected client, so drag-and-drop and edits appear live across browsers without a refresh.
