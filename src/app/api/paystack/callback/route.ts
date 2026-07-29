import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return redirect("/dashboard/tickets?error=Missing+payment+reference");
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackSecret}`,
    },
  });

  const data = await response.json();

  if (data.status && data.data?.status === "success") {
    return redirect("/dashboard/tickets?success=Payment+successful!+Your+tickets+are+ready.");
  } else {
    return redirect("/dashboard/tickets?error=Payment+verification+failed.");
  }
}