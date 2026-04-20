'use client'

import { useState } from 'react'

interface ModeSelectorProps {
  mode: 'listas' | 'items'
  onChange: (mode: 'listas' | 'items') => void
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center rounded-full overflow-hidden border border-border-dark bg-white/80 backdrop-blur-sm">
      <button
        id="mode-listas"
        onClick={() => onChange('listas')}
        className={`px-5 py-1.5 text-sm font-semibold tracking-wide transition-all duration-300 ${
          mode === 'listas'
            ? 'bg-bg-primary text-text-primary shadow-md'
            : 'text-text-dark hover:bg-bg-primary/10'
        } rounded-full`}
      >
        LISTAS
      </button>
      <button
        id="mode-items"
        onClick={() => onChange('items')}
        className={`px-5 py-1.5 text-sm font-semibold tracking-wide transition-all duration-300 ${
          mode === 'items'
            ? 'bg-bg-primary text-text-primary shadow-md'
            : 'text-text-dark hover:bg-bg-primary/10'
        } rounded-full`}
      >
        ITEMS
      </button>
    </div>
  )
}
