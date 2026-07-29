"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const coverImageUrl = formData.get("coverImageUrl") as string;

  const tierNames = formData.getAll("tierName") as string[];
  const tierPrices = formData.getAll("tierPrice") as string[];
  const tierCapacities = formData.getAll("tierCapacity") as string[];

  if (!title || !location || !startDateStr || !endDateStr) {
    return redirect("/dashboard/organizer/create?error=Missing+required+fields");
  }

  // Ensure Profile exists in Prisma before linking foreign keys
  const profile = await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
    },
    create: {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split("@")[0],
      role: "ORGANIZER",
    },
  });

  // Find or create Organization linked to the ensured profile
  let organization = await prisma.organization.findFirst({
    where: { owner_id: profile.id },
  });

  if (!organization) {
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    organization = await prisma.organization.create({
      data: {
        name: `${profile.full_name}'s Organization`,
        slug,
        owner_id: profile.id,
      },
    });
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const event = await prisma.event.create({
    data: {
      organization_id: organization.id,
      title,
      description: description || null,
      location,
      start_date: startDate,
      end_date: endDate,
      cover_image_url: coverImageUrl || null,
      is_published: true,
      ticket_tiers: {
        create: tierNames.map((name, index) => ({
          name,
          price: parseInt(tierPrices[index] || "0", 10),
          capacity: parseInt(tierCapacities[index] || "100", 10),
        })),
      },
    },
  });

  return redirect(`/dashboard/organizer?success=Event+${encodeURIComponent(event.title)}+created`);
}