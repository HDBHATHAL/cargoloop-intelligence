import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow auth API and static files through
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname === '/login') {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('cl_auth')
  const isAuthed = authCookie?.value === process.env.AUTH_SECRET

  if (!isAuthed) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)'],
}
