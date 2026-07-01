import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase not configured
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
          BarberShop
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/book" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Записаться
              </Link>
              <Link
                href="/my-appointments"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Мои записи
              </Link>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit">
                  Выйти
                </Button>
              </form>
            </>
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
      </nav>
    </header>
  );
}
