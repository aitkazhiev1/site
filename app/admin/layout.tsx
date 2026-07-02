import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";

const navItems = [
  { href: "/admin/appointments", label: "Записи" },
  { href: "/admin/barbers", label: "Барберы" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/schedule", label: "Расписание" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) redirect("/login");
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">Админка</h1>
      <nav className="mb-8 flex gap-1 border-b border-zinc-100">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-t-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
