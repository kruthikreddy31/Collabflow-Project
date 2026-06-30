import Link from "next/link";
import { KanbanSquare } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-violet-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <KanbanSquare className="h-4.5 w-4.5 text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">CollabFlow</span>
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          {children}
        </div>
      </div>
    </main>
  );
}
