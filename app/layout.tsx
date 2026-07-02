import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Navbar } from "@/components/features/nav/Navbar";

const inter = Inter({
  variable: "--font-sans-raw",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-display-raw",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BarberShop — Онлайн запись к барберу",
    template: "%s · BarberShop",
  },
  description: "Запишитесь онлайн к лучшим мастерам вашего города. Без очередей, в удобное время.",
  openGraph: {
    title: "BarberShop — Онлайн запись к барберу",
    description:
      "Запишитесь онлайн к лучшим мастерам вашего города. Без очередей, в удобное время.",
    url: siteUrl,
    siteName: "BarberShop",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberShop — Онлайн запись к барберу",
    description: "Запишитесь онлайн к лучшим мастерам вашего города.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-border/60 text-muted-foreground border-t py-8 text-center text-sm">
          © 2026 BarberShop. Все права защищены.
        </footer>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
