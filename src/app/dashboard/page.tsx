import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Ticket, Building2, CreditCard, ShieldAlert } from "lucide-react";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) redirect("/login");

  const isSuperAdmin = profile.role === "SUPERADMIN";

  const [ticketsCount, eventsCount, orgsCount] = await Promise.all([
    prisma.ticket.count({ where: { order: { user_id: user.id } } }),
    prisma.event.count({
      where: { organization: { owner_id: user.id } },
    }),
    prisma.organization.count({ where: { owner_id: user.id } }),
  ]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {profile.full_name || "User"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is an overview of your activity on Tickethub.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              My Tickets
            </span>
            <Ticket className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{ticketsCount}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              My Events
            </span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{eventsCount}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Organizations
            </span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{orgsCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/tickets"
            className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition space-y-2"
          >
            <Ticket className="w-5 h-5 text-indigo-600" />
            <div className="font-semibold text-sm text-slate-900">View Tickets</div>
            <p className="text-xs text-slate-500">Access your purchased virtual event tickets.</p>
          </Link>

          <Link
            href="/dashboard/events"
            className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition space-y-2"
          >
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div className="font-semibold text-sm text-slate-900">Manage Events</div>
            <p className="text-xs text-slate-500">Create and publish new event listings.</p>
          </Link>

          <Link
            href="/dashboard/payouts"
            className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition space-y-2"
          >
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <div className="font-semibold text-sm text-slate-900">Payouts & Banking</div>
            <p className="text-xs text-slate-500">Manage bank details and request revenue payouts.</p>
          </Link>

          {isSuperAdmin && (
            <Link
              href="/dashboard/admin"
              className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl hover:bg-purple-100/50 transition space-y-2"
            >
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              <div className="font-semibold text-sm text-purple-900">Supervisor Portal</div>
              <p className="text-xs text-purple-600">Review payout requests and platform metrics.</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}