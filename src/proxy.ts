import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

const AUTH_PAGES = ['/login', '/signup'];

function extractPathname(request: NextRequest): string {
  return request.nextUrl.pathname.replace(/^\/(en|zh)(\/|$)/, '/');
}

function extractLocale(request: NextRequest): string {
  const match = request.nextUrl.pathname.match(/^\/(en|zh)(\/|$)/);
  return match ? match[1] : '';
}

function forwardCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((cookie) => {
    const { name, value, ...options } = cookie;
    to.cookies.set(name, value, options);
  });
}

export default async function middleware(request: NextRequest) {
  // Refresh Supabase auth session (updates request cookies in-place)
  const { response: supabaseResponse, user } = await updateSession(request);

  const pathname = extractPathname(request);

  // Authenticated users: redirect away from auth pages (preserve locale + cookies)
  if (user && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const locale = extractLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = locale ? `/${locale}` : '/';
    const redirectResponse = NextResponse.redirect(url);
    forwardCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  // Run next-intl middleware with the (potentially updated) request
  const intlResponse = intlMiddleware(request);

  // Forward Supabase auth cookies to the intl response with full options
  forwardCookies(supabaseResponse, intlResponse);

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/api`, `/trpc`, `/auth`, `/_next`, `/_vercel` or `/monitoring`
  // - ... the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|auth|_next|_vercel|monitoring|.*\\..*).*)',
};
