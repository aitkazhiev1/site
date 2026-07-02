import Link from "next/link";
import { getCurrentUserAndProfile, isAdmin } from "@/lib/supabase/session";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/features/nav/MobileNav";

export async function Navbar() {
  let user = null;
  let profile = null;
  try {
    const result = await getCurrentUserAndProfile();
    user = result.user;
    profile = result.profile;
  } catch {
    // Supabase not configured
  }

  const links = user
    ? [
        { href: "/book", label: "Записаться" },
        { href: "/my-appointments", label: "Мои записи" },
        ...(isAdmin(profile) ? [{ href: "/admin", label: "Админка" }] : []),
      ]
    : [];

  return (
    <header className="border-border/60 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-foreground focus-visible:ring-ring focus-visible:ring-offset-background text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Barber<span className="text-accent">Shop</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">
                Выйти
              </Button>
            </form>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Записаться</Button>
              </Link>
            </>
          )}
        </div>

        <MobileNav links={links} isAuthed={!!user} />
      </nav>
    </header>
  );
}
