import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Войти",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Войти</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-accent font-medium underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
