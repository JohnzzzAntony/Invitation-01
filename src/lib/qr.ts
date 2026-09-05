// QR code generation helper (client-side, dynamic import keeps the bundle lean).
// Used by the dashboard (guest check-in QRs, public event links, share dialog).

export interface QrOptions {
  dark?: string // foreground color (default warm charcoal #272727)
  light?: string // background color (default white)
}

export async function qrDataUrl(text: string, opts?: QrOptions): Promise<string> {
  if (!text) throw new Error('QR code needs a non-empty payload')
  try {
    const QRCode = (await import('qrcode')).default
    return await QRCode.toDataURL(text, {
      width: 512,
      margin: 2,
      color: {
        dark: opts?.dark ?? '#272727',
        light: opts?.light ?? '#FFFFFF',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to generate QR code: ${message}`)
  }
}
