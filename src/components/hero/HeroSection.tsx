'use client'

import { ChevronDown } from 'lucide-react'

interface HeroSectionProps {
  onScrollDown: () => void
}

export default function HeroSection({ onScrollDown }: HeroSectionProps) {
  return (
    <section
      id="hero-section"
      className="reel-slide flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(212, 165, 116, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(196, 168, 130, 0.2) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Title */}
        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-normal text-text-primary animate-fade-in-up tracking-wide">
          Opinext
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-xl md:text-2xl italic text-text-secondary mt-4 animate-fade-in-up-delay-1">
          La voz de la comunidad
        </p>

        {/* Description */}
        <p className="text-text-primary/60 text-sm md:text-base mt-6 leading-relaxed animate-fade-in-up-delay-2">
          Listas, puntuaciones y opiniones creadas por personas como vos.
        </p>

        {/* Scroll CTA */}
        <button
          id="scroll-down-cta"
          onClick={onScrollDown}
          className="mt-16 flex flex-col items-center gap-2 text-text-primary/50 hover:text-text-primary/80 transition-colors animate-fade-in-up-delay-3 cursor-pointer group"
        >
          <span className="text-xs tracking-[0.25em] uppercase">
            Desplaza hacia abajo para comenzar
          </span>
          <ChevronDown
            size={20}
            className="animate-bounce-down group-hover:text-text-secondary transition-colors"
          />
        </button>
      </div>
    </section>
  )
}
