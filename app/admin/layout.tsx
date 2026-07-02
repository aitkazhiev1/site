import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile, isAdmin } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: {
    default: "Админка",
    template: "%s · Админка",
  },
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin/appointments", label: "Записи" },
  { href: "/admin/barbers", label: "Барберы" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/schedule", label: "Расписание" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) redirect("/login");
  if (!isAdmin(profile)) redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display mb-6 text-2xl font-semibold">Админка</h1>
      <nav className="border-border/60 mb-8 flex gap-1 border-b">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground hover:bg-surface hover:text-foreground rounded-t-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
