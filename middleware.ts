import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/all-products',
  '/new-drop',
  '/about',
  '/contact',
  '/product/(.*)',
  '/payment-success(.*)',
  '/api/product/list',
  '/api/inngest',
  '/api/paystack/webhook',  // Paystack calls this — it has no Clerk token
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Add the ngrok bypass header to every response.
  // This tells ngrok not to show its warning interstitial page.
  // Completely harmless in production — ngrok just ignores it.
  const response = NextResponse.next()
  response.headers.set('ngrok-skip-browser-warning', 'true')
  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
