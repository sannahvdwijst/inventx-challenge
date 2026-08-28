"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ORGANISER_COOKIE } from "@/lib/organiser-auth";

export async function organiserLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ORGANISER_COOKIE);
  redirect("/organiser/login");
}
