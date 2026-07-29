import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CheckoutButton from "./CheckoutButton";
import { Calendar, MapPin, Ticket, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organization: true,
      ticket_tiers: true,
    },
  });

  if (!event || !event.is_published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {event.organization.name}
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">{event.title}</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            {event.description || "No description provided."}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(event.start_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Ticket Tiers Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Available Ticket Tiers</h2>

          <div className="grid grid-cols-1 gap-4">
            {event.ticket_tiers.map((tier) => {
              const remaining = Math.max(0, tier.capacity - tier.tickets_sold);
              const isSoldOut = remaining === 0;

              return (
                <div
                  key={tier.id}
                  className={`p-5 rounded-2xl border flex items-center justify-between transition ${
                    isSoldOut
                      ? "bg-slate-100 border-slate-200 opacity-75"
                      : "bg-white border-slate-200 shadow-sm hover:border-indigo-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{tier.name}</h3>
                      {isSoldOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          Sold Out
                        </span>
                      ) : (
                        remaining <= 5 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            Only {remaining} left!
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      ₦{tier.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Checkout Button Modal Launcher */}
                  {isSoldOut ? (
                    <button
                      disabled
                      className="px-5 py-2.5 bg-slate-300 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  ) : (
                    <CheckoutButton tier={tier} remaining={remaining} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}