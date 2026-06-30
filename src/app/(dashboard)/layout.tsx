import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={session.user} />
      <div className="flex-1 pl-64">{children}</div>
    </div>
  );
}
