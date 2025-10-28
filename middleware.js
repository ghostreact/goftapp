import { NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "accessToken";

const routeRoles = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/teacher", roles: ["teacher"] },
  { prefix: "/workplace", roles: ["workplace"] },
  { prefix: "/student", roles: ["student"] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login")) {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const rule = routeRoles.find(({ prefix }) =>
    pathname.startsWith(prefix)
  );

  if (!rule) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (rule.roles.length && !rule.roles.includes(payload.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/workplace/:path*", "/student/:path*", "/login"],
};

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT in middleware", error);
    return null;
  }
}

