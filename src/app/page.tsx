'use client'

import { useState, useCallback } from 'react'
import Navbar from '@/components/navbar/Navbar'
import ScrollExpandHero from '@/components/hero/ScrollExpandHero'
import ReelViewer from '@/components/reels/ReelViewer'
import DetailPanel from '@/components/detail/DetailPanel'

export default function HomePage() {
  const [mode, setMode] = useState<'listas' | 'items'>('listas')
  const [detailTarget, setDetailTarget] = useState<{ type: 'list' | 'item'; id: string } | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleActiveItemChange = useCallback((id: string, type: 'list' | 'item') => {
    setDetailTarget({ id, type })
  }, [])

  return (
    <>
      <Navbar
        mode={mode}
        onModeChange={setMode}
        isTransparent={!isExpanded}
      />

      <ScrollExpandHero
        mode={mode}
        onFullyExpanded={setIsExpanded}
        expandedContent={
          <div className="w-full h-full">
            <ReelViewer mode={mode} onActiveItemChange={handleActiveItemChange} />
          </div>
        }
      >
        {/* Content below the hero, visible after expansion + scroll */}
        <section className="min-h-[100dvh] w-full bg-white">
          {detailTarget ? (
            <DetailPanel
              type={detailTarget.type}
              id={detailTarget.id}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-text-dark/40">
              Cargando detalles...
            </div>
          )}
        </section>
      </ScrollExpandHero>
    </>
  )
}
