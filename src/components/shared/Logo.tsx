'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

// Brand wordmark: warm-accent rounded square with filled Heart + "Online RSVP".
// size="sm" for app bars, "md" (default) for marketing pages.
// Purely presentational — parents attach click handlers.
export function Logo({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string }) {
  const isSm = size === 'sm'
  return (
    <span className={cn('inline-flex select-none items-center gap-2', className)}>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center bg-[#9A7B5B] text-white shadow-sm',
          isSm ? 'h-7 w-7 rounded-lg' : 'h-9 w-9 rounded-xl'
        )}
        aria-hidden="true"
      >
        <Heart className={cn('fill-current', isSm ? 'h-4 w-4' : 'h-5 w-5')} strokeWidth={1.5} />
      </span>
      <span
        className={cn(
          'font-semibold tracking-tight text-[#1F2937]',
          isSm ? 'text-sm' : 'text-lg'
        )}
      >
        Online RSVP
      </span>
    </span>
  )
}
