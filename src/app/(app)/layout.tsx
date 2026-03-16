"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TrendingUp, LineChart, MapPin } from "lucide-react";

const tabs = [
  { href: "/mercado", label: "Mercado", icon: TrendingUp },
  { href: "/previsao", label: "Previsão", icon: LineChart },
  { href: "/regional", label: "Regional", icon: MapPin },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Header - minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">B</span>
            </div>
            <span className="text-display text-sm tracking-wider text-primary">BULLCAST</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse-dot" />
            <span className="text-label text-[10px] text-bull">AO VIVO</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-12 pb-[72px] w-full overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation - 3 tabs only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-bottom"
        role="navigation"
        aria-label="Navegação Principal"
      >
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-3 relative transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-primary rounded-full" />
                )}
                <Icon
                  className={cn("w-5 h-5 mb-1 transition-transform duration-300", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
