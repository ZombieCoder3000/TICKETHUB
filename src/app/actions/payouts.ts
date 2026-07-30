"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBankDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountName = formData.get("accountName") as string;

  if (!bankName || !accountNumber || !accountName) {
    throw new Error("All bank fields are required");
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
    },
  });

  revalidatePath("/dashboard/payouts");
}

export async function requestPayout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile || !profile.bank_name || !profile.account_number) {
    throw new Error("Please save your bank details before requesting a payout.");
  }

  const amount = parseInt(formData.get("amount") as string, 10);

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid withdrawal amount.");
  }

  await prisma.payoutRequest.create({
    data: {
      profile_id: profile.id,
      amount,
      bank_name: profile.bank_name,
      account_number: profile.account_number,
      account_name: profile.account_name || profile.full_name,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/payouts");
}