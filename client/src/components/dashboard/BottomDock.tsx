
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Ticket,
  Megaphone, 
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
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <nav className="mx-auto max-w-md pointer-events-auto bg-background/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 animate-in slide-in-from-bottom-10 fade-in">
        <div className="flex justify-around items-center h-[4.5rem] px-2 relative">
          {navItems.map((item) => {
            const currentItemIsActive = item.href === '/dashboard' 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-tighter w-full p-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] focus:outline-none h-full group perspective-1000",
                  currentItemIsActive ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-10",
                  "group-active:scale-90 group-active:rotate-x-12",
                  currentItemIsActive 
                    ? "w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 text-white rounded-[1.25rem] -translate-y-5 shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.5)] ring-4 ring-background/50 scale-110" 
                    : "w-10 h-8 hover:bg-muted/20 rounded-xl"
                )}>
                  <item.icon className={cn("transition-transform duration-500", currentItemIsActive ? "h-6 w-6" : "h-5 w-5 opacity-100 group-hover:scale-110")} />
                  
                  {/* Glass highlight on active icon */}
                  {currentItemIsActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[1.25rem] pointer-events-none" />
                  )}
                </div>
                
                <span className={cn(
                    "transition-all duration-500 mt-0.5",
                    currentItemIsActive ? "opacity-100 font-black -translate-y-3" : "opacity-100 font-black text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.label}
                </span>

                {/* Folding reflection/shadow effect on active */}
                {currentItemIsActive && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

    