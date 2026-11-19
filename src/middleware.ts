import { NextResponse, type NextRequest } from "next/server";

/**
 * First line of defence for the admin area: no session cookie, no entry.
 * Full session and role checks happen server side in every admin page and
 * action (see requireUser in src/lib/auth.ts).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !req.cookies.get("mn_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  if (pathname.startsWith("/admin")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
