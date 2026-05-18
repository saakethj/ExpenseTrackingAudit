import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh w-full flex-1 flex-col">
      <div className="auth-backdrop" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/logo.png"
            alt="ExpenseTrackingManagement"
            width={612}
            height={408}
            style={{ height: '90px', width: 'auto' }}
            priority
          />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
