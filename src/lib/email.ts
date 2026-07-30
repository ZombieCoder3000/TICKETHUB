import { Resend } from "resend";
import QRCode from "qrcode";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

interface SendTicketEmailParams {
  toEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTier: string;
  ticketCode: string;
}

export async function sendTicketEmail({
  toEmail,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  ticketTier,
  ticketCode,
}: SendTicketEmailParams) {
  // Generate Data URL for QR Code
  const qrDataUrl = await QRCode.toDataURL(ticketCode, {
    width: 300,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; color: #0f172a;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0;">
          <h1 style="color: #4f46e5; margin-bottom: 5px;">Your Ticket for ${eventTitle}</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Hi ${userName}, get ready for your event!</p>
          
          <div style="border-top: 1px border-bottom: 1px solid #e2e8f0; padding: 15px 0; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket Tier:</strong> ${ticketTier}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Date & Time:</strong> ${eventDate}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Location:</strong> ${eventLocation}</p>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket Reference:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${ticketCode}</code></p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <img src="${qrDataUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; border-radius: 12px; border: 1px solid #e2e8f0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">Present this QR code at the event gate for check-in.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; pt: 15px;">
            <p style="font-size: 12px; color: #94a3b8;">Powered by <strong>Tickethub</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "Tickethub <tickets@resend.dev>",
      to: [toEmail],
      subject: `Ticket Confirmed: ${eventTitle}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send ticket email via Resend:", error);
  }
}