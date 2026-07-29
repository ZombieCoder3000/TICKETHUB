"use client";

import { useState } from "react";
import { createEvent } from "@/app/actions/events";

export default function CreateEventPage() {
  const [tiers, setTiers] = useState([
    { name: "General Admission", price: 0, capacity: 100 },
  ]);

  const addTier = () => {
    setTiers([...tiers, { name: "", price: 0, capacity: 50 }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length === 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-sm text-gray-500">
          Fill in the details below to publish your event and ticket tiers.
        </p>
      </div>

      <form action={createEvent} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Event Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="e.g. Tech Summit 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="Provide a summary of what attendees should expect..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location / Venue *
            </label>
            <input
              type="text"
              name="location"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="e.g. Eko Hotels, Lagos or Online Zoom Link"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                name="startDate"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                name="endDate"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImageUrl"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-semibold">Ticket Tiers</h2>
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none"
            >
              + Add Tier
            </button>
          </div>

          {tiers.map((tier, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg bg-gray-50 relative grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Tier Name *
                </label>
                <input
                  type="text"
                  name="tierName"
                  required
                  defaultValue={tier.name}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                  placeholder="e.g. VIP Pass"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Price (NGN) *
                </label>
                <input
                  type="number"
                  name="tierPrice"
                  required
                  min="0"
                  defaultValue={tier.price}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                  placeholder="0 for Free"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-medium text-gray-700">
                  Capacity *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="tierCapacity"
                    required
                    min="1"
                    defaultValue={tier.capacity}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                  />
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      className="mt-1 text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Publish Event
          </button>
        </div>
      </form>
    </div>
  );
}