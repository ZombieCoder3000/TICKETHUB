import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrganizerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const events = await prisma.event.findMany({
    where: {
      organization: {
        owner_id: user.id,
      },
    },
    include: {
      ticket_tiers: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizer Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your events, track sales, and check in attendees.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/organizer/scanner"
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>📷</span> Scan Tickets
          </Link>
          <Link
            href="/dashboard/organizer/create"
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
          >
            + Create Event
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 text-sm">You haven't created any events yet.</p>
          <Link
            href="/dashboard/organizer/create"
            className="mt-3 inline-block text-sm font-semibold text-black underline"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const totalSold = event.ticket_tiers.reduce((acc, t) => acc + t.tickets_sold, 0);
            const totalCapacity = event.ticket_tiers.reduce((acc, t) => acc + t.capacity, 0);

            return (
              <div key={event.id} className="border rounded-lg p-5 bg-white shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {event.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-xs text-gray-500">📍 {event.location}</p>
                <p className="text-xs text-gray-400">
                  📅 {new Date(event.start_date).toLocaleDateString()}
                </p>

                <div className="pt-2 border-t flex justify-between text-xs text-gray-600">
                  <span>Tickets Sold:</span>
                  <span className="font-semibold">
                    {totalSold} / {totalCapacity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}