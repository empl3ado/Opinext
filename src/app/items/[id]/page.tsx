'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { Heart, MessageCircle, Share2, MapPin, Star, Eye } from 'lucide-react'
import ReviewSection from '@/components/reviews/ReviewSection'
import CommentSection from '@/components/comments/CommentSection'
import BuyButton from '@/components/shop/BuyButton'

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'reviews'>('info')

  useEffect(() => {
    const fetchItem = async () => {
      const resolvedParams = await params
      const { data } = await supabase
        .from('items')
        .select(`
          *,
          profiles ( id, username, display_name, avatar_url, role ),
          categories ( name ),
          subcategories ( name )
        `)
        .eq('id', resolvedParams.id)
        .single()

      if (data) {
        setItem(data)
        // Incrementar vistas
        await supabase.from('items').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id)
      }
      setLoading(false)
    }
    fetchItem()
  }, [params, supabase])

  if (loading) return <div className="min-h-screen bg-bg-page flex items-center justify-center">Cargando...</div>
  if (!item) return <div className="min-h-screen bg-bg-page flex items-center justify-center font-serif text-2xl">Ítem no encontrado</div>

  return (
    <main className="min-h-screen bg-bg-page flex flex-col">
      <Navbar mode="items" onModeChange={() => {}} isTransparent />

      {/* Cover / Media */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-[#E5E0D8]">
        {item.image_url && (
          <Image src={item.image_url} alt={item.title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-white">
            <div className="flex gap-2 mb-3">
              {item.categories?.name && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm">
                  {item.categories.name}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif leading-tight drop-shadow-md mb-2">
              {item.title}
            </h1>
            {item.location && (
              <p className="flex items-center gap-2 text-white/80 text-sm md:text-base drop-shadow">
                <MapPin className="w-4 h-4" /> {item.location}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors">
              <Heart className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex-1 flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <div className="flex border-b border-border-dark/10 mb-8">
            <button onClick={() => setActiveTab('info')} className={`pb-4 mr-8 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'info' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              Detalle
              {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`pb-4 mr-8 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'reviews' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              Reseñas
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
            <button onClick={() => setActiveTab('comments')} className={`pb-4 text-sm font-semibold tracking-wider uppercase transition-colors relative flex items-center gap-2 ${activeTab === 'comments' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              <MessageCircle size={16} /> Preguntas
              {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
          </div>

          <div className="pb-24">
            {activeTab === 'info' && (
              <div>
                <p className="text-text-dark/80 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                  {item.content || item.description || 'Sin descripción adicional.'}
                </p>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <ReviewSection targetId={item.id} />
                <div className="py-8 text-center text-text-dark/40 text-sm font-medium">
                  No hay reseñas para mostrar.
                </div>
              </div>
            )}
            {activeTab === 'comments' && <CommentSection targetId={item.id} />}
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm sticky top-24">
            <h4 className="text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-4">Vendedor</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 overflow-hidden shrink-0 relative">
                {item.profiles?.avatar_url ? (
                  <Image src={item.profiles.avatar_url} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif bg-[#E5E0D8]">
                    {item.profiles?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-text-dark">@{item.profiles?.username}</p>
                <p className="text-xs text-text-dark/60">Verificado</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-black/5 flex justify-between text-center">
              <div>
                <p className="text-xl font-serif text-text-dark">{item.avg_rating || '0.0'}</p>
                <p className="text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mt-1">Rating</p>
              </div>
              <div>
                <p className="text-xl font-serif text-text-dark">{item.view_count || 0}</p>
                <p className="text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mt-1">Vistas</p>
              </div>
            </div>

            {item.is_commercial && (
              <div className="mt-8 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-black/5 border border-black/5 text-center">
                  <span className="text-xs font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Precio</span>
                  <span className="text-3xl font-serif text-text-dark">${item.price || 'Consultar'}</span>
                </div>
                <BuyButton 
                  sellerId={item.user_id} 
                  productTitle={item.title} 
                  price={item.price} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
