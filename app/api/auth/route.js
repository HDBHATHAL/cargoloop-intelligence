import { NextResponse } from 'next/server'

export async function POST(request) {
  const { password } = await request.json()
  const correct = process.env.DASHBOARD_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('cl_auth', process.env.AUTH_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return response
}
