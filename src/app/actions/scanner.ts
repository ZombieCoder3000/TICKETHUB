"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function verifyAndCheckInTicket(qrHash: string) {
  if (!qrHash) {
    return { success: false, message: "No QR code hash provided." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { qr_code_hash: qrHash },
    include: {
      tier: {
        include: {
          event: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    return { success: false, message: "Invalid ticket QR code." };
  }

  if (ticket.tier.event.organization.owner_id !== user.id) {
    return { success: false, message: "You are not authorized to scan tickets for this event." };
  }

  if (ticket.status === "USED") {
    return {
      success: false,
      message: `Ticket already used at ${ticket.scanned_at ? new Date(ticket.scanned_at).toLocaleTimeString() : "an earlier time"}.`,
      ticket,
    };
  }

  if (ticket.status === "CANCELLED") {
    return { success: false, message: "This ticket has been cancelled.", ticket };
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: "USED",
      scanned_at: new Date(),
    },
    include: {
      tier: {
        include: {
          event: true,
        },
      },
    },
  });

  return {
    success: true,
    message: "Check-in successful! Ticket verified.",
    ticket: updatedTicket,
  };
}