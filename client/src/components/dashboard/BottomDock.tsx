"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Ticket,
  MoreHorizontal,
  Gamepad2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMobileDetailActive } from '@/contexts/MobileDetailActiveContext';

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/dashboard/games", label: "Games", icon: Gamepad2 },
  { href: "/dashboard/more", label: "More", icon: MoreHorizontal },
];

export function BottomDock() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isMobileDetailActive } = useMobileDetailActive();

  if (!isMobile || isMobileDetailActive) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <nav className="mx-auto max-w-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const currentItemIsActive = item.href === '/dashboard' 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-all focus:outline-none relative",
                  currentItemIsActive ? "text-primary font-semibold" : "text-muted-foreground/80 hover:text-foreground"
                )}
              >
                {/* Active indicator bar at top of active tab (Facebook style) */}
                {currentItemIsActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                )}
                
                <item.icon className={cn("h-5 w-5 mb-0.5 transition-transform duration-200", currentItemIsActive && "scale-105")} />
                
                <span className="text-[9px] tracking-tight uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}