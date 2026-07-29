"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return redirect("/signup?error=Missing+required+fields");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await prisma.profile.upsert({
      where: { id: data.user.id },
      update: {
        full_name: fullName,
        email,
      },
      create: {
        id: data.user.id,
        full_name: fullName,
        email,
        role: "ATTENDEE",
      },
    });
  }

  return redirect("/onboarding");
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Missing+email+or+password");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/dashboard/tickets");
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const role = formData.get("role") as "ATTENDEE" | "ORGANIZER";

  if (!role || (role !== "ATTENDEE" && role !== "ORGANIZER")) {
    return redirect("/onboarding?error=Please+select+a+valid+role");
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: { role },
  });

  if (role === "ORGANIZER") {
    return redirect("/dashboard/organizer");
  }

  return redirect("/dashboard/tickets");
}