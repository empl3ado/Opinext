'use client'

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

/* No static PREVIEW here anymore */

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
interface ScrollExpandHeroProps {
  mode: 'listas' | 'items'
  onFullyExpanded?: (expanded: boolean) => void
  /** Content rendered BELOW the hero after expansion (DetailPanel etc.) */
  children?: ReactNode
  preview: {
    id: string
    image: string
    title: string
    author: string
    tag: string
  } | null
}

export default function ScrollExpandHero({
  mode,
  onFullyExpanded,
  children,
  preview,
}: ScrollExpandHeroProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [fullyExpanded, setFullyExpanded] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()


  const sectionRef = useRef<HTMLDivElement | null>(null)

  /* Reset on mode change */
  useEffect(() => {
    setScrollProgress(0)
    setFullyExpanded(false)
    onFullyExpanded?.(false)
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- Wheel / Touch / Scroll listeners ---- */
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (fullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        // Scroll up at top → collapse
        setFullyExpanded(false)
        setScrollProgress(0.95)
        onFullyExpanded?.(false)
        e.preventDefault()
      } else if (!fullyExpanded) {
        e.preventDefault()
        const delta = e.deltaY * 0.0009
        const next = Math.min(Math.max(scrollProgress + delta, 0), 1)
        setScrollProgress(next)

        if (next >= 1) {
          setFullyExpanded(true)
          onFullyExpanded?.(true)
          if (preview) {
            router.push(`/${mode === 'listas' ? 'lists' : 'items'}/${preview.id}`)
          }
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY

      if (fullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setFullyExpanded(false)
        setScrollProgress(0.95)
        onFullyExpanded?.(false)
        e.preventDefault()
      } else if (!fullyExpanded) {
        e.preventDefault()
        const factor = deltaY < 0 ? 0.008 : 0.005
        const next = Math.min(Math.max(scrollProgress + deltaY * factor, 0), 1)
        setScrollProgress(next)

        if (next >= 1) {
          setFullyExpanded(true)
          onFullyExpanded?.(true)
          if (preview) {
            router.push(`/${mode === 'listas' ? 'lists' : 'items'}/${preview.id}`)
          }
        }
        setTouchStartY(touchY)
      }
    }

    const handleTouchEnd = () => setTouchStartY(0)

    const handleScroll = () => {
      if (!fullyExpanded) window.scrollTo(0, 0)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollProgress, fullyExpanded, touchStartY, onFullyExpanded])

  /* ---- Responsive ---- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ---- Derived values ---- */
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const startW = isMobile ? 260 : 340
  const startH = isMobile ? 320 : 400
  const panelW = startW + scrollProgress * (vw - startW)
  const panelH = startH + scrollProgress * (vh - startH)
  const radius = Math.max(0, 20 - scrollProgress * 20)
  const textSlide = scrollProgress * (isMobile ? 180 : 150)
  const shadowOpacity = Math.max(0, 0.3 - scrollProgress * 0.3)
  const imageScale = 1 + scrollProgress * 0.1
  const bgOpacity = fullyExpanded ? 0 : 1

  return (
    <div ref={sectionRef} className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* ===== Background (fades out) ===== */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.05 }}
          >
            <div
              className="w-full h-full bg-bg-primary"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(212,165,116,0.3) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(196,168,130,0.2) 0%, transparent 50%)
                `,
              }}
            />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          {/* ===== Main content area ===== */}
          <div className="w-full flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">

              {/* --- Expanding panel --- */}
              <div
                className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                style={{
                  width: fullyExpanded ? '100vw' : `${panelW}px`,
                  height: fullyExpanded ? '100dvh' : `${panelH}px`,
                  maxWidth: '100vw',
                  maxHeight: '100dvh',
                  borderRadius: fullyExpanded ? 0 : `${radius}px`,
                  boxShadow: fullyExpanded
                    ? 'none'
                    : `0 0 50px rgba(0,0,0,${shadowOpacity})`,
                  transition: fullyExpanded ? 'border-radius 0.3s, box-shadow 0.3s' : 'none',
                }}
              >
                {/* Static preview (shown while animating) */}
<div 
  className="relative w-full h-full"
  style={{ opacity: fullyExpanded ? 0 : 1, transition: 'opacity 0.3s' }}
>
  <div className="absolute inset-0 bg-black" />
  <motion.div
    className="absolute inset-0 z-0"
    style={{ 
      scale: imageScale,
      opacity: bgOpacity
    }}
  >
    {preview?.image ? (
      <img 
        src={preview?.image} 
        alt={preview?.title || ''}
        className="w-full h-full object-cover opacity-80"
      />
    ) : null}
  </motion.div>
  {/* Gradient overlay */}
  <div className="gradient-overlay absolute inset-0" />

  {/* Dark overlay that lightens as we expand */}
  <motion.div
    className="absolute inset-0 bg-black/40"
    animate={{ opacity: Math.max(0, 0.5 - scrollProgress * 0.4) }}
    transition={{ duration: 0.05 }}
  />

  {/* Preview info */}
  <motion.div
    className="absolute bottom-0 left-0 right-0 p-5 md:p-8"
    animate={{ opacity: Math.max(0, 1 - scrollProgress * 1.5) }}
  >
    <span className="text-xs font-bold uppercase tracking-wider text-white/60 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
      {preview?.tag || mode}
    </span>
    <h3 className="font-serif text-lg md:text-xl text-white leading-snug mt-1 line-clamp-2">
      {preview?.title || 'Cargando...'}
    </h3>
    <div className="flex items-center gap-2 mt-3">
      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
        {preview?.author?.[0]?.toUpperCase() || 'U'}
      </div>
      <span className="text-sm font-semibold tracking-wide text-white drop-shadow-md">
        @{preview?.author || 'usuario'}
      </span>
    </div>
  </motion.div>
</div>

                {/* Expanded content */}
                <div 
                  className="relative z-10 w-full"
                  style={{ 
                    pointerEvents: fullyExpanded ? 'auto' : 'none',
                    opacity: fullyExpanded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {fullyExpanded && (
                    <div className="flex h-screen items-center justify-center bg-black/40 backdrop-blur-sm text-white">
                      <span className="animate-pulse font-serif text-2xl">Abriendo {mode}...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* --- Title text that slides away --- */}
              <div className="flex items-center justify-center text-center gap-3 w-full relative z-30 flex-col pointer-events-none mix-blend-difference">
                <motion.h1
                  className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal text-text-primary tracking-wide"
                  style={{ transform: `translateX(-${textSlide}vw)` }}
                  animate={{ opacity: Math.max(0, 1 - scrollProgress * 2) }}
                >
                  Opinext
                </motion.h1>
                <motion.p
                  className="font-serif text-lg md:text-xl italic text-text-secondary"
                  style={{ transform: `translateX(${textSlide}vw)` }}
                  animate={{ opacity: Math.max(0, 1 - scrollProgress * 2) }}
                >
                </motion.p>
              </div>

              {/* --- Scroll hint --- */}
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
                animate={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
              >
                <p className="text-text-primary/40 text-[10px] tracking-[0.25em] uppercase animate-fade-in-up-delay-3">
                  Desliza hacia abajo para comenzar
                </p>
                <div className="flex justify-center mt-2 animate-bounce-down">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary/30">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </motion.div>
            </div>

            {/* --- Children (below hero, visible after expansion) --- */}
            <motion.section
              className="flex flex-col w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: fullyExpanded ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  )
}
