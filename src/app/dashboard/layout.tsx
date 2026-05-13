import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh w-full flex-1 flex-col">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(45% 40% at 85% 15%, var(--purple-soft) 0%, transparent 65%), radial-gradient(40% 35% at 10% 85%, var(--orange-soft) 0%, transparent 65%)",
        }}
      />
      <DashboardNav />
      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
    </div>
  );
}
