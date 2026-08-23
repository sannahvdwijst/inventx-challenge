import "server-only";
import { createHash } from "crypto";

export const ORGANISER_COOKIE = "organiser_session";

export function organiserSessionToken() {
  const password = process.env.ORGANISER_PASSWORD!;
  return createHash("sha256").update(password).digest("hex");
}

export function isValidOrganiserPassword(candidate: string) {
  return candidate === process.env.ORGANISER_PASSWORD;
}
