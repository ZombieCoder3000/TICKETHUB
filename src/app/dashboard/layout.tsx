import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SidebarNav from "@/components/dashboard/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <SidebarNav
        user={{
          email: user.email || "",
          fullName: profile?.full_name || user.user_metadata?.full_name,
          role: profile?.role,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}