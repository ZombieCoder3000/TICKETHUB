"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=Email and password are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncUserProfile(user.user_metadata?.full_name);
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password) {
    redirect("/signup?error=Email and password are required");
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await syncUserProfile(fullName);
  }

  redirect("/onboarding");
}

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (fullName) {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { full_name: fullName },
      create: {
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        role: "CLIENT",
      },
    });
  }

  redirect("/dashboard");
}

export async function syncUserProfile(fullName?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        id: user.id,
        full_name: fullName || user.user_metadata?.full_name || "",
        email: user.email || "",
        role: "CLIENT",
      },
    });
  }

  return { success: true };
}