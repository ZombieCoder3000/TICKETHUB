"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface CheckoutInput {
  eventId: string;
  tierId: string;
  quantity: number;
  holderName: string;
  holderEmail: string;
  userId?: string;
}

export async function createCheckoutSession(input: CheckoutInput) {
  const { eventId, tierId, quantity, holderName, holderEmail, userId } = input;

  if (!tierId || !quantity || quantity < 1 || !holderName || !holderEmail) {
    throw new Error("Invalid request parameters.");
  }

  const tier = await prisma.ticketTier.findUnique({
    where: { id: tierId },
    include: { event: true },
  });

  if (!tier) {
    throw new Error("Selected ticket tier not found.");
  }

  if (tier.tickets_sold + quantity > tier.capacity) {
    throw new Error("Not enough tickets remaining for this tier.");
  }

  const totalAmountInKobo = tier.price * quantity * 100;

  const order = await prisma.order.create({
    data: {
      user_id: userId || null,
      event_id: eventId,
      total_amount: tier.price * quantity,
      payment_status: "PENDING",
    },
  });

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: holderEmail,
      amount: totalAmountInKobo,
      reference: order.id,
      callback_url: `${baseUrl}/api/paystack/callback`,
      metadata: {
        order_id: order.id,
        tier_id: tierId,
        quantity: quantity,
        holder_name: holderName,
        holder_email: holderEmail,
        custom_fields: [
          {
            display_name: "Event",
            variable_name: "event_title",
            value: tier.event.title,
          },
        ],
      },
    }),
  });

  const data = await response.json();

  if (!data.status || !data.data?.authorization_url) {
    throw new Error(data.message || "Unable to initialize payment gateway.");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { payment_reference: order.id },
  });

  return redirect(data.data.authorization_url);
}