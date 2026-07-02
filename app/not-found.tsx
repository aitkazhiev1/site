import Link from "next/link";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <Scissors className="text-accent mb-6 h-10 w-10" aria-hidden />
      <p className="font-display text-accent text-sm font-medium tracking-[0.2em] uppercase">404</p>
      <h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Страница не найдена</h1>
      <p className="text-muted-foreground mt-4 max-w-sm">
        Похоже, эта страница подстриглась и ушла. Вернитесь на главную или запишитесь к мастеру.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button variant="outline">На главную</Button>
        </Link>
        <Link href="/book">
          <Button>Записаться</Button>
        </Link>
      </div>
    </div>
  );
}
