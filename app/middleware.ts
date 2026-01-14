import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
/*
export default createMiddleware({
  // Supported locales
  locales: ['en', 'ar'],

  // Default locale (no prefix, e.g., `/login` defaults to English)
  defaultLocale: 'en',

  // Optional: Locale detector (e.g., from headers/cookies)
  localeDetection: true
});*/

export default function middleware(request: NextRequest) {

   const cookieValue = request.cookies.get('user_id')?.value;
  console.log(`Cookie 'yourCookieName' value:`, cookieValue);

   createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localeDetection: true
  })(request);

  return NextResponse.next();
 }


export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next|.*\\..*).*)']
};