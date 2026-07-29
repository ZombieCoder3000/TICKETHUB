import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Ticket, Calendar, MapPin, ArrowRight } from "lucide-react";

export const revalidate = 0; // Ensure fresh events on every load

export default async function HomePage() {
   const events = await prisma.event.findMany({
    where: {
      is_published: true,
    },
    include: {
      ticket_tiers: true,
      organization: true,
    },
    orderBy: {
      start_date: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Ticket className="w-5 h-5" />
            </div>
            <span>Tickethub</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Discover & Book Unforgettable Events
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Find tickets for concerts, tech conferences, workshops, and meetups host by creators near you.
          </p>
        </div>
      </section>

      {}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-sm text-slate-500">Browse live events available for booking</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-800">No events scheduled yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Check back soon or create your own event as an organizer!
            </p>
            <Link
              href="/signup"
              className="inline-block mt-2 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Create an event &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              
              const lowestPrice = event.ticket_tiers.length > 0
                ? Math.min(...event.ticket_tiers.map((tier) => tier.price))
                : 0;

              return (
                <div
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {}
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-400">
                      {event.cover_image_url ? (
                        <img
                          src={event.cover_image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Calendar className="w-12 h-12 text-slate-300" />
                      )}
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        {lowestPrice === 0 ? "Free" : `From ₦${lowestPrice.toLocaleString()}`}
                      </div>
                    </div>

                    {}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                          {event.organization.name}
                        </p>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {event.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {event.description || "No description provided."}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(event.start_date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/events/${event.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition"
                    >
                      <span>Get Tickets</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Ticketa. All rights reserved.
      </footer>
    </div>
  );
}