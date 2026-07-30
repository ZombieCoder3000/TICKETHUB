import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SidebarNav
        userRole={profile?.role || "CLIENT"}
        canHostEvents={profile?.role === "SUPERADMIN"}
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}