'use client'

import { useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ListReel from './ListReel'
import ItemReel from './ItemReel'

// Demo data for initial render
const DEMO_LISTS = [
  {
    id: '1',
    title: 'Mis rincones favoritos para leer en Buenos Aires',
    description: 'Una selección personal de lugares con buen café y silencio absoluto. Espacios donde el tiempo se detiene.',
    cover_image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
    user: { username: 'lectora_nomade', avatar_url: null },
    upvotes: 1243,
    downvotes: 32,
    saves: 856,
    featured_comment: {
      username: 'buenos_libros',
      content: '¡Increíble selección! Precisamente buscaba lugares así.',
    },
  },
  {
    id: '2',
    title: 'Mejores bares de vino natural en Palermo',
    description: 'Los bares que realmente valen la pena para disfrutar de vinos naturales sin etiquetas.',
    cover_image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
    user: { username: 'vino_aventura', avatar_url: null },
    upvotes: 2891,
    downvotes: 45,
    saves: 1204,
    featured_comment: {
      username: 'enofilo_ba',
      content: 'El tercer bar de la lista es una joya escondida.',
    },
  },
  {
    id: '3',
    title: 'Rutas de trekking imperdibles en Patagonia',
    description: 'Senderos que te van a dejar sin aliento — literal y figurativamente.',
    cover_image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    user: { username: 'caminos_del_sur', avatar_url: null },
    upvotes: 4521,
    downvotes: 18,
    saves: 3200,
    featured_comment: {
      username: 'trekking_arg',
      content: 'Hice la ruta 2 el mes pasado. Totalmente de acuerdo.',
    },
  },
]

const DEMO_ITEMS = [
  {
    id: '1',
    title: 'Disfrutando de un Malbec Gran Guarda increíble en mi viaje a Mendoza. La complejidad y el cuerpo son de otro planeta.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
    avg_rating: 4.8,
    rating_count: 342,
    upvotes: 2400,
    downvotes: 23,
    saves: 856,
    user: { username: 'julio_sperez', avatar_url: null },
    preview_comments: [
      { username: 'vinolover', content: '¡Qué envidia! Ese viñedo es espectacular.' },
      { username: 'mendoza_guide', content: 'Excelente elección. ¿Probaste el maridaje con carnes rojas?' },
      { username: 'sommelier_ana', content: 'Notas a frutos negros y cuero, imagino. Una joya.' },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Este café de especialidad en San Telmo me voló la cabeza. Tostado medio, notas a chocolate y naranja.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    avg_rating: 4.5,
    rating_count: 189,
    upvotes: 1800,
    downvotes: 12,
    saves: 623,
    user: { username: 'cafe_porteño', avatar_url: null },
    preview_comments: [
      { username: 'barista_bsas', content: '¡Ese lugar es increíble! El cold brew también.' },
      { username: 'coffee_nerd', content: '¿De qué origen es el grano? Suena a Etiopía.' },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    title: 'Atardecer desde el Cerro Campanario en Bariloche. No hay foto que le haga justicia.',
    content: '',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    avg_rating: 4.9,
    rating_count: 567,
    upvotes: 5200,
    downvotes: 8,
    saves: 2100,
    user: { username: 'viajera_sur', avatar_url: null },
    preview_comments: [
      { username: 'patagonia_fan', content: 'El mejor mirador de la zona, sin dudas.' },
      { username: 'foto_natural', content: '¡Qué colores! ¿A qué hora fuiste para esa luz?' },
      { username: 'turismo_arg', content: 'Agregado a mi lista de pendientes.' },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

interface ReelViewerProps {
  mode: 'listas' | 'items'
  onActiveItemChange?: (id: string, type: 'list' | 'item') => void
}

export default function ReelViewer({ mode, onActiveItemChange }: ReelViewerProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const data = mode === 'listas' ? DEMO_LISTS : DEMO_ITEMS

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

  // Reset active item when mode changes (defaults to first item)
  useEffect(() => {
    if (data.length > 0 && onActiveItemChange) {
      onActiveItemChange(data[0].id, mode === 'listas' ? 'list' : 'item')
    }
  }, [mode, data, onActiveItemChange])

  return (
    <div className="reel-slide relative bg-bg-secondary w-full">
      {/* Horizontal carousel */}
      <div
        ref={carouselRef}
        className="carousel-container h-full w-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
      >
        {mode === 'listas'
          ? DEMO_LISTS.map((list) => (
              <div key={list.id} data-id={list.id} className="min-w-full w-full h-full snap-start shrink-0">
                <ListReel list={list} onOpenDetail={() => {}} />
              </div>
            ))
          : DEMO_ITEMS.map((item) => (
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
