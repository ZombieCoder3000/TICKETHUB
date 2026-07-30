import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateBankDetails, requestPayout } from "@/app/actions/payouts";
import { Building2, ArrowUpRight, History, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export const revalidate = 0;

export default async function ClientPayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      payout_requests: {
        orderBy: { created_at: "desc" },
      },
      organizations: {
        include: {
          events: true,
        },
      },
    },
  });

  if (!profile) redirect("/login");

  // Get all event IDs belonging to user's organizations
  const eventIds = profile.organizations.flatMap((org) => org.events.map((evt) => evt.id));

  // Query total successful orders for these events
  const successfulOrders = eventIds.length > 0
    ? await prisma.order.findMany({
        where: {
          event_id: { in: eventIds },
          payment_status: "SUCCESSFUL",
        },
        select: { total_amount: true },
      })
    : [];

  const totalEarnings = successfulOrders.reduce((acc, ord) => acc + ord.total_amount, 0);

  const totalWithdrawn = profile.payout_requests
    .filter((req) => req.status === "APPROVED")
    .reduce((sum, req) => sum + req.amount, 0);

  const pendingPayouts = profile.payout_requests
    .filter((req) => req.status === "PENDING")
    .reduce((sum, req) => sum + req.amount, 0);

  const availableBalance = totalEarnings - totalWithdrawn - pendingPayouts;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Payouts & Banking
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your payout account details and request funds from your ticket sales.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Revenue Earned
          </span>
          <p className="text-2xl font-bold text-slate-900">
            ₦{totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Pending Approval
          </span>
          <p className="text-2xl font-bold text-amber-700">
            ₦{pendingPayouts.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Available for Withdrawal
          </span>
          <p className="text-2xl font-bold text-emerald-700">
            ₦{availableBalance < 0 ? 0 : availableBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Bank Account Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Bank Account Setup</h2>
          </div>

          <form action={updateBankDetails} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                defaultValue={profile.bank_name || ""}
                placeholder="e.g. Zenith Bank, Access Bank, Kuda"
                required
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                defaultValue={profile.account_number || ""}
                placeholder="10-digit account number"
                maxLength={10}
                required
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                defaultValue={profile.account_name || profile.full_name}
                placeholder="Name registered on bank account"
                required
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              Save Bank Details
            </button>
          </form>
        </div>

        {/* Card 2: Request Payout */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Request Withdrawal</h2>
          </div>

          {!profile.bank_name ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Please add your bank account details on the left before submitting a payout request.
              </p>
            </div>
          ) : (
            <form action={requestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount to Withdraw (₦)
                </label>
                <input
                  type="number"
                  name="amount"
                  min={1000}
                  max={availableBalance}
                  placeholder="Minimum ₦1,000"
                  required
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-900"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available: ₦{availableBalance < 0 ? 0 : availableBalance.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Receiving Account:</div>
                <div>{profile.bank_name} - <span className="font-mono">{profile.account_number}</span></div>
                <div className="text-slate-500">{profile.account_name}</div>
              </div>

              <button
                type="submit"
                disabled={availableBalance < 1000}
                className={`w-full py-2.5 font-semibold text-sm rounded-xl transition shadow-sm ${
                  availableBalance >= 1000
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Submit Withdrawal Request
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Section 3: Withdrawal Request History */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          Payout History
        </h2>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {profile.payout_requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Bank Details</th>
                    <th className="p-4">Requested On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Supervisor Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile.payout_requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">
                        ₦{req.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {req.bank_name} ({req.account_number})
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {req.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                        {req.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        )}
                        {req.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right text-xs text-slate-500 italic">
                        {req.admin_notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}