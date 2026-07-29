"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  Calendar,
  PlusCircle,
  QrCode,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert,
} from "lucide-react";

interface SidebarNavProps {
  user: {
    email: string;
    fullName?: string;
    role?: string;
  };
}

export default function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      name: "My Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
    },
    {
      name: "Organizer Overview",
      href: "/dashboard/organizer",
      icon: Calendar,
    },
    {
      name: "Create Event",
      href: "/dashboard/organizer/create",
      icon: PlusCircle,
    },
    {
      name: "QR Ticket Scanner",
      href: "/dashboard/organizer/scanner",
      icon: QrCode,
    },
  ];

  return (
    <>
      {}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/dashboard/tickets" className="flex items-center gap-2 font-bold text-lg">
          <Ticket className="w-5 h-5 text-indigo-400" />
          <span>Tickethub</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {}
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link
              href="/dashboard/tickets"
              className="flex items-center gap-2.5 font-bold text-xl text-white tracking-tight"
            >
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <Ticket className="w-5 h-5" />
              </div>
              <span>Ticketa</span>
            </Link>
          </div>

          {}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 font-bold text-xs">
                {user.fullName ? user.fullName[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user.fullName || "User Account"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition"
              >
              <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}