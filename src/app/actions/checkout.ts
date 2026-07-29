"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createCheckoutSession(formData: FormData) {
  const tierId = formData.get("tierId") as string;
  const quantityStr = formData.get("quantity") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;

  const quantity = parseInt(quantityStr || "1", 10);

  if (!tierId || !email || !fullName || quantity < 1) {
    return redirect(`/events?error=Missing+required+checkout+details`);
  }

  const tier = await prisma.ticketTier.findUnique({
    where: { id: tierId },
    include: { event: true },
  });

  if (!tier) {
    return redirect("/events?error=Ticket+tier+not+found");
  }

  const remaining = tier.capacity - tier.tickets_sold;

  if (quantity > remaining) {
    return redirect(
      `/events/${tier.event.id}?error=Only+${remaining}+ticket(s)+available+for+${encodeURIComponent(
        tier.name
      )}`
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing PAYSTACK_SECRET_KEY in environment variables.");
    return redirect(`/events/${tier.event.id}?error=Payment+gateway+configuration+error`);
  }

  const totalAmountInKobo = tier.price * quantity * 100;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let checkoutUrl: string | null = null;

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: totalAmountInKobo,
        callback_url: `${appUrl}/api/paystack/callback`,
        metadata: {
          tier_id: tier.id,
          event_id: tier.event.id,
          quantity,
          full_name: fullName,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack Initialization Error:", data);
      return redirect(
        `/events/${tier.event.id}?error=${encodeURIComponent(
          data.message || "Failed to initialize Paystack checkout"
        )}`
      );
    }

    checkoutUrl = data.data.authorization_url;
  } catch (error) {
    console.error("Paystack Network Fetch Error:", error);
    return redirect(`/events/${tier.event.id}?error=Network+error+initializing+payment`);
  }

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }
}