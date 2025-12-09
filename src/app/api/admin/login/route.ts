import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Admin credentials - in production, use environment variables and proper hashing
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session token (simple implementation)
    const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64')

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
