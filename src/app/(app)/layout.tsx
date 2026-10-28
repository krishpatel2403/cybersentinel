import { requireUser } from "@/lib/security/session";
import { isDemoMode } from "@/lib/env";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="relative min-h-screen">
      <div className="grid-backdrop" aria-hidden="true" />
      <Sidebar isAdmin={user.role === "admin"} />
      <div className="relative z-10 md:pl-[260px]">
        <Topbar user={user} demoMode={isDemoMode()} />
        <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-7 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
