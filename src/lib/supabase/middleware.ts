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

  // Handle OAuth code exchange if code is present (from any URL)
  const code = searchParams.get('code')
  if (code && pathname !== '/auth/callback') {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user to check if they have a customer profile
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id)
          .single()

        // Create redirect response with updated cookies
        const redirectUrl = customer
          ? new URL('/customer/dashboard', origin)
          : new URL('/register', origin)

        const redirectResponse = NextResponse.redirect(redirectUrl)

        // Copy cookies from supabaseResponse to redirectResponse
        supabaseResponse.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })

        return redirectResponse
      }
    }

    // If code exchange failed, redirect to login with error
    return NextResponse.redirect(new URL('/customer/login?error=auth_callback_error', origin))
  }

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  return supabaseResponse
}
