"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home, BarChart3, Newspaper, User, MapPin, ShieldAlert, History } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const tabs = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/mercado", label: "Mercado", icon: BarChart3 },
  { href: "/precos-regionais", label: "Regional", icon: MapPin },
  { href: "/riscos", label: "Riscos", icon: ShieldAlert },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/perfil", label: "Perfil", icon: User },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode })
{
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col relative selection:bg-primary/20">

      <main className="flex-1 pb-[70px] md:pb-0 md:pl-[90px] relative z-10 w-full overflow-x-hidden">
        {children}
      </main>

      {/* Architectural Bottom Nav for Mobile - Flush with bottom, 0 border radius */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex safe-bottom"
        role="navigation"
        aria-label="Navegação Principal"
      >
        {tabs.map((tab) =>
        {
          const isActive = pathname === tab.href || (tab.href !== "/inicio" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-4 border-r border-border last:border-0 relative transition-colors duration-300 group-nav-link",
                isActive ? "text-foreground bg-secondary/40" : "text-muted-foreground hover:bg-secondary/20"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="w-5 h-5 mb-1.5"
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-micro">
                {tab.label}
              </span>
            </Link>
          );
        })}
        <div className="flex-1 flex flex-col items-center justify-center py-4 transition-colors duration-300 text-muted-foreground hover:bg-secondary/20">
          <ThemeToggle />
        </div>
      </nav>

      {/* Architectural Side Nav for Desktop - Sharp, rigid vertical column */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-[90px] bg-background border-r border-border flex-col items-center py-8 z-50">
        {/* Monogram Logo */}
        <div className="w-10 h-10 bg-foreground flex items-center justify-center mb-16 shadow-[2px_2px_0_var(--color-primary)]">
          <span className="text-background font-editorial font-bold text-xl italic">B</span>
        </div>
        <div className="flex flex-col w-full flex-1">
          {tabs.map((tab) =>
          {
            const isActive = pathname === tab.href || (tab.href !== "/inicio" && pathname.startsWith(tab.href));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                title={tab.label}
                className={cn(
                  "w-full flex flex-col items-center justify-center py-6 relative transition-colors group",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-primary" />
                )}
                <Icon className="w-6 h-6 mb-2 transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={isActive ? 2 : 1.2} />
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="pb-4">
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}
