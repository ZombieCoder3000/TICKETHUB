"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEventAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized");
  }

  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split("@")[0],
        role: "CLIENT",
      },
    });
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const state = formData.get("state") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const organizationId = formData.get("organizationId") as string;

  if (!title || !startDate || !organizationId) {
    throw new Error("Missing required event fields.");
  }

  await prisma.event.create({
    data: {
      title,
      description: description || "",
      location: location || "",
      state: state || "Lagos",
      start_date: new Date(startDate),
      end_date: endDate ? new Date(endDate) : new Date(startDate),
      organization_id: organizationId,
    },
  });

  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export const createEvent = createEventAction;