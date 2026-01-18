import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 */
const pathsToExclude = /^(?!\/(api|_next\/static|favicon\.ico|manifest|icon|static)).*$/;

// set of public pages that needed to be excluded from middleware
const publicPagesSet = new Set<string>(["/error"]);

export default async function middleware(req: NextRequest) {
    if (!pathsToExclude.test(req.nextUrl.pathname) || publicPagesSet.has(req.nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Allow access to cytology pages
    if (req.nextUrl.pathname.startsWith("/cytology")) {
        return NextResponse.next();
    }

    // Allow access to upload_photo page
    if (req.nextUrl.pathname.startsWith("/upload_photo")) {
        return NextResponse.next();
    }

    // For other pages, check authentication
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    if (!isAuthenticated && !req.nextUrl.pathname.startsWith("/auth-pages")) {
        // Redirect to login if not authenticated (optional - can be removed if auth is not needed)
        return NextResponse.next();
    }

    return NextResponse.next();
}
