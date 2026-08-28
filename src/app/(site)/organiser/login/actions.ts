"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORGANISER_COOKIE, isValidOrganiserPassword, organiserSessionToken } from "@/lib/organiser-auth";

export async function organiserLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/organiser");

  if (!isValidOrganiserPassword(password)) {
    redirect(`/organiser/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(ORGANISER_COOKIE, organiserSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(from.startsWith("/organiser") ? from : "/organiser");
}
