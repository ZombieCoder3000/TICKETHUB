import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function handleSignOut(request: Request) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL("/signup", requestUrl.origin), {
    status: 302,
  });
}

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}