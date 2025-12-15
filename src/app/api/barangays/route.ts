import { NextRequest, NextResponse } from 'next/server'
import { getBarangaysByCity } from '@/lib/data/philippines'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cityCode = searchParams.get('cityCode')

  if (!cityCode) {
    return NextResponse.json(
      { message: 'cityCode parameter is required' },
      { status: 400 }
    )
  }

  const barangays = getBarangaysByCity(cityCode)

  return NextResponse.json({ barangays })
}
