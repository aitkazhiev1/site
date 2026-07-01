import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Войти</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
