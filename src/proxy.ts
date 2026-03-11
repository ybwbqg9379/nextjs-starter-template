import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Refresh Supabase auth session (updates request cookies in-place)
  const supabaseResponse = await updateSession(request);

  // Run next-intl middleware with the (potentially updated) request
  const intlResponse = intlMiddleware(request);

  // Forward Supabase auth cookies to the intl response with full options
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    const { name, value, ...options } = cookie;
    intlResponse.cookies.set(name, value, options);
  });

  return intlResponse;
}

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/api`, `/trpc`, `/_next`, `/_vercel` or `/monitoring`
  // - ... the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)',
};
