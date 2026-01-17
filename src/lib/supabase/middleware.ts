import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { pathname, searchParams, origin } = request.nextUrl

  // Check if accessing protected admin routes (not login page)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')

  if (isAdminRoute) {
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession?.value) {
      // Redirect to login if no session
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If logged in and trying to access login page, redirect to admin
  if (pathname === '/admin/login') {
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value) {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // OAuth code exchange is handled client-side (code verifier stored in browser)
  // Redirect code to /auth/callback for client-side processing
  const code = searchParams.get('code')
  if (code && pathname !== '/auth/callback') {
    const callbackUrl = new URL('/auth/callback', origin)
    callbackUrl.searchParams.set('code', code)
    return NextResponse.redirect(callbackUrl)
  }

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  return supabaseResponse
}
