import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (profile?.role === "ORGANIZER") {
    return redirect("/dashboard/organizer");
  }

  return redirect("/dashboard/tickets");
}