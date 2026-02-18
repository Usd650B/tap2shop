import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create Supabase client if environment variables are available
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is admin route
  if (pathname.startsWith('/admin')) {
    // If Supabase is not configured, show setup message
    if (!supabase) {
      return NextResponse.redirect(new URL('/setup-required', request.url))
    }

    // Get user from session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Redirect to login if no user
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.email === 'SIPKING@sip.co.tz' ||
                   user.email === 'admin@sip.co.tz'

    if (!isAdmin) {
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url))

      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
