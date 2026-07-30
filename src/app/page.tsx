import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  Ticket,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    query?: string;
    state?: string;
    dateFilter?: string;
    timeFilter?: string;
  }>;
}

const NIGERIAN_STATES = [
  "FCT - Abuja",
  "Lagos",
  "Kano",
  "Rivers",
  "Oyo",
  "Enugu",
  "Kaduna",
  "Edo",
  "Delta",
  "Ogun",
];

export default async function HomePage({ searchParams }: PageProps) {
  const { query, state, dateFilter, timeFilter } = await searchParams;

  const now = new Date();
  const whereClause: any = {
    is_published: true,
  };

  // Search query filter (title/description/location)
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ];
  }

  // State filter
  if (state && state !== "ALL") {
    whereClause.state = state;
  }

  // Date range filter
  if (dateFilter) {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (dateFilter === "TODAY") {
      whereClause.start_date = {
        gte: todayStart,
        lte: todayEnd,
      };
    } else if (dateFilter === "WEEKEND") {
      // Find upcoming Saturday & Sunday
      const dayOfWeek = now.getDay();
      const distanceToSaturday = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(todayStart);
      saturday.setDate(todayStart.getDate() + distanceToSaturday);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59);

      whereClause.start_date = {
        gte: saturday,
        lte: sunday,
      };
    } else if (dateFilter === "NEXT_7_DAYS") {
      const nextWeek = new Date(todayStart);
      nextWeek.setDate(todayStart.getDate() + 7);

      whereClause.start_date = {
        gte: todayStart,
        lte: nextWeek,
      };
    }
  } else {
    // Default: Show future or currently running events
    whereClause.end_date = {
      gte: now,
    };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: { start_date: "asc" },
    include: {
      organization: true,
      ticket_tiers: {
        orderBy: { price: "asc" },
      },
    },
  });

  // Client-side/In-memory Time of Day Filter (Morning: <12pm, Afternoon: 12pm-5pm, Evening: >5pm)
  const filteredEvents = events.filter((event) => {
    if (!timeFilter || timeFilter === "ALL") return true;
    const hours = new Date(event.start_date).getHours();

    if (timeFilter === "MORNING") return hours < 12;
    if (timeFilter === "AFTERNOON") return hours >= 12 && hours < 17;
    if (timeFilter === "EVENING") return hours >= 17;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Local Experiences & Events
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Find and Book Tickets for Events Near You
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Filter by state, date, and time to discover tech conferences, concerts, workshops, and nightlife across Nigeria.
          </p>

          {/* Search & Filter Bar Form */}
          <form
            action="/"
            method="GET"
            className="bg-white text-slate-900 p-4 rounded-2xl shadow-xl max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
          >
            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Search className="w-3.5 h-3.5" /> Search Event
              </label>
              <input
                type="text"
                name="query"
                defaultValue={query || ""}
                placeholder="Title, venue, host..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> State / Region
              </label>
              <select
                name="state"
                defaultValue={state || "ALL"}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All States</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Range
              </label>
              <select
                name="dateFilter"
                defaultValue={dateFilter || "ALL"}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Upcoming</option>
                <option value="TODAY">Today</option>
                <option value="WEEKEND">This Weekend</option>
                <option value="NEXT_7_DAYS">Next 7 Days</option>
              </select>
            </div>

            {/* Time Filter */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time of Day
                </label>
                <select
                  name="timeFilter"
                  defaultValue={timeFilter || "ALL"}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Any Time</option>
                  <option value="MORNING">Morning (&lt; 12 PM)</option>
                  <option value="AFTERNOON">Afternoon (12 PM - 5 PM)</option>
                  <option value="EVENING">Night / Evening (&gt; 5 PM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition flex items-center gap-1 shrink-0"
              >
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Events Grid Section */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            Explore Published Events ({filteredEvents.length})
          </h2>

          {(query || (state && state !== "ALL") || dateFilter || timeFilter) && (
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Clear All Filters
            </Link>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <p className="text-slate-600 font-semibold text-lg">No events match your criteria</p>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Try adjusting your search terms, state, date, or time filters to find live events.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const lowestPrice =
                evt.ticket_tiers.length > 0
                  ? Math.min(...evt.ticket_tiers.map((t) => t.price))
                  : 0;

              return (
                <div
                  key={evt.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                >
                  {/* Cover Image */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    {evt.cover_image_url ? (
                      <img
                        src={evt.cover_image_url}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                        <Ticket className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full">
                      {lowestPrice === 0 ? "Free" : `₦${lowestPrice.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                        <MapPin className="w-3.5 h-3.5" />
                        {evt.state}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {evt.description || "No event description provided."}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.start_date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.start_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <Link
                        href={`/events/${evt.id}`}
                        className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1"
                      >
                        View & Get Tickets
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}