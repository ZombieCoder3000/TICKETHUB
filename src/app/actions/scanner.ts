"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function validateTicketCode(ticketId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized scanner session." };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      order: true,
      tier: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!ticket) {
    return { success: false, message: "Invalid ticket QR code!" };
  }

  if (ticket.status === "USED") {
    return {
      success: false,
      message: `TICKET ALREADY USED! Scanned on ${new Date(
        ticket.updated_at
      ).toLocaleTimeString()}`,
      ticket,
    };
  }

  if (ticket.status === "CANCELLED") {
    return { success: false, message: "TICKET CANCELLED", ticket };
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "USED" },
  });

  return {
    success: true,
    message: "TICKET VALIDATED SUCCESSFULLY! ENTRY GRANTED.",
    ticket: {
      ...ticket,
      status: updatedTicket.status,
    },
  };
}

export const verifyAndCheckInTicket = validateTicketCode;