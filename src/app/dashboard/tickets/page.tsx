import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TicketQRCode from "./TicketQRCode";

export default async function AttendeeTicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return redirect("/login");
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      holder_email: user.email,
    },
    include: {
      tier: {
        include: {
          event: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-sm text-gray-500">
          View and access QR codes for your upcoming events.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 text-sm">You don't have any tickets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {ticket.tier.event.title}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      ticket.status === "VALID"
                        ? "bg-green-100 text-green-800"
                        : ticket.status === "USED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500">📍 {ticket.tier.event.location}</p>
                <p className="text-xs text-gray-500">
                  📅 {new Date(ticket.tier.event.start_date).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-700 block">
                    {ticket.tier.name}
                  </span>
                  <span className="text-xs text-gray-400">{ticket.holder_name}</span>
                </div>

                {ticket.status === "VALID" && (
                  <TicketQRCode
                    qrHash={ticket.qr_code_hash}
                    ticketId={ticket.id}
                    eventName={ticket.tier.event.title}
                    tierName={ticket.tier.name}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}