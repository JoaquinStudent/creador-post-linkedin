"use client";

import { Geist } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-colors ${
        active
          ? "text-linkedin bg-linkedin-light dark:bg-linkedin/15 font-medium"
          : "text-gray-600 dark:text-gray-300 hover:text-linkedin hover:bg-gray-50 dark:hover:bg-neutral-800"
      }`}
    >
      {children}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <title>LinkedIn Post Creator</title>
        <meta name="description" content="Genera posts de LinkedIn para tus eventos con IA" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors">
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 sticky top-0 z-10 transition-colors">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-linkedin text-lg">
              PostCreator
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <NavLink href="/">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>
                Crear
              </NavLink>
              <NavLink href="/historial">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Historial
              </NavLink>
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
