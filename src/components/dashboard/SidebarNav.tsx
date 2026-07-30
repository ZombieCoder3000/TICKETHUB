"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Building2,
  CreditCard,
  ShieldAlert,
  Camera,
} from "lucide-react";

interface SidebarNavProps {
  userRole?: string;
  canHostEvents?: boolean;
}

export function SidebarNav({ userRole = "CLIENT", canHostEvents = false }: SidebarNavProps) {
  const pathname = usePathname();

  const isSuperAdmin = userRole === "SUPERADMIN";

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: "My Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
      show: true,
    },
    {
      label: "My Events",
      href: "/dashboard/events",
      icon: Calendar,
      show: canHostEvents || isSuperAdmin,
    },
    {
      label: "Organizations",
      href: "/dashboard/organizations",
      icon: Building2,
      show: canHostEvents || isSuperAdmin,
    },
    {
      label: "Payouts & Banking",
      href: "/dashboard/payouts",
      icon: CreditCard,
      show: canHostEvents || isSuperAdmin,
    },
    {
      label: "Gate QR Scanner",
      href: "/dashboard/scanner",
      icon: Camera,
      show: canHostEvents || isSuperAdmin,
    },
    {
      label: "Supervisor Portal",
      href: "/dashboard/admin",
      icon: ShieldAlert,
      show: isSuperAdmin,
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </h2>
        </div>

        <nav className="space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? item.highlight
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-900 text-white shadow-sm"
                      : item.highlight
                      ? "text-purple-700 bg-purple-50 hover:bg-purple-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="px-3 py-2 text-[11px] text-slate-400 font-mono">
          Role: <span className="font-semibold text-slate-700">{userRole}</span>
        </div>
      </div>
    </aside>
  );
}