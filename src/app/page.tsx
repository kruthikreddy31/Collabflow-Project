import Link from "next/link";
import {
  ArrowRight,
  KanbanSquare,
  Users,
  Zap,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <KanbanSquare className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">CollabFlow</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-subtle hover:bg-primary-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center">
        <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
          Real-time boards for fast-moving teams
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
          Plan, track, and ship work{" "}
          <span className="text-primary-600">together</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          CollabFlow brings kanban boards, live collaboration, and analytics
          into one clean workspace — built for teams that move fast.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-subtle hover:bg-primary-700"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-24 sm:grid-cols-3">
        {[
          {
            icon: KanbanSquare,
            title: "Drag-and-drop boards",
            desc: "Move tasks across columns with buttery-smooth drag and drop.",
          },
          {
            icon: Zap,
            title: "Real-time sync",
            desc: "Every change appears instantly for every teammate, live.",
          },
          {
            icon: BarChart3,
            title: "Built-in analytics",
            desc: "Track throughput, priority mix, and completion trends.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <f.icon className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-1.5">
          <Users size={14} /> CollabFlow — built for teams
        </div>
      </footer>
    </main>
  );
}
