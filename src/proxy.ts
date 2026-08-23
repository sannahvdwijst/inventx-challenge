import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ORGANISER_COOKIE, organiserSessionToken } from "@/lib/organiser-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/organiser/login") {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ORGANISER_COOKIE)?.value;
  if (cookie === organiserSessionToken()) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/organiser/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/organiser/:path*"],
};
