import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Регистрация",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold">Регистрация</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-accent font-medium underline underline-offset-4">
            Войти
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
