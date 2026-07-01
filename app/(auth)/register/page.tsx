import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Регистрация</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline underline-offset-4">
            Войти
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
