import { NextRequest, NextResponse } from 'next/server'
import { getBarangays } from '@/lib/services/psgc'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cityCode = searchParams.get('cityCode')

  if (!cityCode) {
    return NextResponse.json(
      { message: 'cityCode parameter is required' },
      { status: 400 }
    )
  }

  try {
    const barangays = await getBarangays(cityCode)

    return NextResponse.json({ barangays })
  } catch (error) {
    console.error('Failed to fetch barangays:', error)
    return NextResponse.json(
      { message: 'Failed to fetch barangays', barangays: [] },
      { status: 500 }
    )
  }
}
