import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // supabaseResponse must be returned as-is (or with cookies copied) so that
  // Supabase can write refreshed access/refresh tokens back to the browser.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT with Supabase and refreshes if needed.
  // Hard 4-second timeout: when DNS fails for the Supabase host, Node's
  // resolver can hang 30+ seconds before rejecting — past Vercel's 10s
  // function limit, causing a 504. If we lose the race, fall back to
  // getSession() which decodes the JWT from cookies locally with no network.
  let user = null
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), 4000)
      ),
    ])
    if (!result.error) user = result.data.user
  } catch {
    const { data: { session } } = await supabase.auth.getSession()
    user = session?.user ?? null
  }

  const { pathname } = request.nextUrl

  const isAuthRoute      = pathname.startsWith('/login')
                        || pathname.startsWith('/signup')
                        || pathname.startsWith('/forgot-password')
                        || pathname.startsWith('/auth')
  const isDashboardRoute = pathname.startsWith('/dashboard')

  if (isDashboardRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    const redirectResponse = NextResponse.redirect(loginUrl)
    // Copy any refreshed-token cookies so the browser keeps them on redirect
    supabaseResponse.cookies.getAll().forEach(cookie =>
      redirectResponse.cookies.set(cookie.name, cookie.value, { path: '/' })
    )
    return redirectResponse
  }

  if (isAuthRoute && user) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(dashUrl)
    supabaseResponse.cookies.getAll().forEach(cookie =>
      redirectResponse.cookies.set(cookie.name, cookie.value, { path: '/' })
    )
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/forgot-password', '/auth/:path*'],
}
