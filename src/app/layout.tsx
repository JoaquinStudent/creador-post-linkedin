import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkedIn Post Creator",
  description: "Genera posts de LinkedIn para tus eventos con IA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors">
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 sticky top-0 z-10 transition-colors">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-linkedin text-lg">
              PostCreator
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-linkedin transition-colors">
                Crear
              </Link>
              <Link href="/historial" className="text-gray-600 dark:text-gray-300 hover:text-linkedin transition-colors">
                Historial
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
