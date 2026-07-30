import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (secret && signature) {
      const hash = crypto
        .createHmac("sha512", secret)
        .update(bodyText)
        .digest("hex");

      if (hash !== signature) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(bodyText);

    if (event.event === "charge.success") {
      const data = event.data;
      const orderId = data.reference || data.metadata?.order_id;
      const tierId = data.metadata?.tier_id;
      const quantity = data.metadata?.quantity || 1;
      const holderEmail = data.customer?.email || data.metadata?.holder_email || "guest@example.com";
      const holderName = data.metadata?.holder_name || "Valued Guest";

      if (orderId) {
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (existingOrder && (existingOrder.payment_status as string) !== "COMPLETED") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              payment_status: "COMPLETED" as any,
              payment_reference: data.reference,
            },
          });

          if (tierId) {
            const tier = await prisma.ticketTier.findUnique({
              where: { id: tierId },
              include: { event: true },
            });

            if (tier) {
              await prisma.ticketTier.update({
                where: { id: tierId },
                data: {
                  tickets_sold: { increment: quantity },
                },
              });

              for (let i = 0; i < quantity; i++) {
                const qrHash = crypto.randomUUID();

                const ticket = await prisma.ticket.create({
                  data: {
                    order_id: orderId,
                    tier_id: tierId,
                    holder_name: holderName,
                    holder_email: holderEmail,
                    qr_code_hash: qrHash,
                    status: "VALID" as any,
                  },
                });

                if (holderEmail) {
                  await sendTicketEmail({
                    toEmail: holderEmail,
                    userName: holderName,
                    eventTitle: tier.event.title,
                    eventDate: new Date(tier.event.start_date).toLocaleString("en-NG", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }),
                    eventLocation: `${tier.event.location}, ${tier.event.state}`,
                    ticketTier: tier.name,
                    ticketCode: ticket.id,
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    );
  }
}