'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ListReel from './ListReel'
import ItemReel from './ItemReel'

import { createClient } from '@/lib/supabase/client'

interface ReelViewerProps {
  mode: 'listas' | 'items'
  onActiveItemChange?: (id: string, type: 'list' | 'item') => void
}

export default function ReelViewer({ mode, onActiveItemChange }: ReelViewerProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (mode === 'listas') {
        const { data: lists } = await supabase
          .from('lists')
          .select(`
            *,
            profiles:user_id ( username, avatar_url )
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(10)
        
        setData(lists || [])
      } else {
        const { data: items } = await supabase
          .from('items')
          .select(`
            *,
            profiles:user_id ( username, avatar_url )
          `)
          .order('created_at', { ascending: false })
          .limit(10)
          
        setData(items || [])
      }
      setLoading(false)
    }
    
    fetchData()
  }, [mode, supabase])

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const width = carouselRef.current.offsetWidth
    carouselRef.current.scrollBy({
      left: direction === 'right' ? width : -width,
      behavior: 'smooth',
    })
  }, [])

  // Detect active item using IntersectionObserver
  useEffect(() => {
    const container = carouselRef.current
    if (!container || !onActiveItemChange) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const id = entry.target.getAttribute('data-id')
            if (id) {
              onActiveItemChange(id, mode === 'listas' ? 'list' : 'item')
            }
          }
        })
      },
      {
        root: container,
        threshold: 0.5, // 50% visibility required to be considered "active"
      }
    )

    // Observe all children
    Array.from(container.children).forEach((child) => observer.observe(child))

    return () => observer.disconnect()
  }, [mode, data, onActiveItemChange])

  // Reset active item when data is loaded
  useEffect(() => {
    if (data.length > 0 && onActiveItemChange) {
      onActiveItemChange(data[0].id, mode === 'listas' ? 'list' : 'item')
    } else if (data.length === 0 && onActiveItemChange && !loading) {
      onActiveItemChange('', mode === 'listas' ? 'list' : 'item')
    }
  }, [data, mode, onActiveItemChange, loading])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-white">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-secondary text-white">
        <div className="text-center">
          <p className="text-xl font-serif mb-2">No hay {mode} para mostrar</p>
          <p className="text-sm text-white/50">No hay más por ver.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reel-slide relative bg-bg-secondary w-full">
      {/* Horizontal carousel */}
      <div
        ref={carouselRef}
        className="carousel-container h-full w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
      >
        {mode === 'listas'
          ? data.map((list) => (
              <div key={list.id} data-id={list.id} className="min-w-full w-full h-full snap-start shrink-0">
                <ListReel list={list} onOpenDetail={() => {}} />
              </div>
            ))
          : data.map((item) => (
              <div key={item.id} data-id={item.id} className="min-w-full w-full h-full snap-start shrink-0">
                <ItemReel item={item} onOpenDetail={() => {}} />
              </div>
            ))}
      </div>

      {/* Navigation arrows */}
      <button
        id="carousel-prev"
        onClick={() => scrollCarousel('left')}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass hover:bg-white/15 transition-all group"
      >
        <ChevronLeft size={24} className="text-text-primary/70 group-hover:text-text-primary transition-colors" />
      </button>
      <button
        id="carousel-next"
        onClick={() => scrollCarousel('right')}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full glass hover:bg-white/15 transition-all group"
      >
        <ChevronRight size={24} className="text-text-primary/70 group-hover:text-text-primary transition-colors" />
      </button>

      {/* Scroll hint at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none">
        <p className="text-text-primary/40 text-[10px] tracking-widest uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">
          ↓ Desliza para detalles
        </p>
      </div>
    </div>
  )
}
