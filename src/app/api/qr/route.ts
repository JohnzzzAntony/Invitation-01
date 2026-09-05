import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// Tiny QR endpoint for the static frontend.
// GET /api/qr?text=hello&dark=%23272727&light=%23FFFFFF -> image/svg+xml
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? ''
  if (!text) {
    return NextResponse.json({ error: 'text query param is required' }, { status: 400 })
  }
  const dark = req.nextUrl.searchParams.get('dark') ?? '#272727'
  const light = req.nextUrl.searchParams.get('light') ?? '#FFFFFF'
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: 1,
      width: 512,
      errorCorrectionLevel: 'M',
      color: { dark, light },
    })
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (e) {
    console.error('qr error', e)
    return NextResponse.json({ error: 'Could not generate QR code' }, { status: 500 })
  }
}
