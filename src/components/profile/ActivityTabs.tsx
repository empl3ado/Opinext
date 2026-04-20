'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { getUserActivity } from '@/app/actions/profile'

type TabType = 'lists' | 'items' | 'reviews' | 'comments'

export default function ActivityTabs({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('lists')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    getUserActivity(userId, activeTab).then(res => {
      if (isMounted) {
        setData(res)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [userId, activeTab])

  const tabs: { id: TabType, label: string }[] = [
    { id: 'lists', label: 'LISTAS' },
    { id: 'items', label: 'ITEMS' },
    { id: 'reviews', label: 'RESEÑAS' },
    { id: 'comments', label: 'COMENTARIOS' }
  ]

  return (
    <div className="pt-8 pb-24">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-8">
        <h2 className="text-3xl font-serif text-text-dark italic">Actividad</h2>
        <div className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[10px] font-bold tracking-[0.15em] uppercase pb-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-text-dark text-text-dark' 
                  : 'border-transparent text-text-dark/40 hover:text-text-dark/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-black/5 rounded-3xl" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="py-20 text-center text-text-dark/40 font-serif italic text-xl">
          No hay actividad reciente para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          
          {activeTab === 'lists' && data.map(item => (
            <Link href={`/lists/${item.id}`} key={item.id} className="group relative h-72 md:h-80 rounded-3xl overflow-hidden block">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
              {item.cover_image_url ? (
                <Image src={item.cover_image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full bg-[#E5E0D8]" />
              )}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white">
                {item.categories?.name && (
                  <span className="self-start text-[9px] font-bold uppercase tracking-wider px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-3">
                    {item.categories.name}
                  </span>
                )}
                <h3 className="text-2xl font-serif leading-tight mb-2">{item.title}</h3>
                <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
              </div>
            </Link>
          ))}

          {activeTab === 'items' && data.map(item => (
            <Link href={`/items/${item.id}`} key={item.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow border border-black/5 block">
              <div className="text-[10px] text-text-dark/40 font-bold uppercase tracking-wider mb-2">Item Individual</div>
              <h3 className="text-xl font-serif text-text-dark mb-3">{item.title}</h3>
              <p className="text-text-dark/60 text-sm line-clamp-3 mb-4">{item.description}</p>
              {item.image_url && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mt-auto">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                </div>
              )}
            </Link>
          ))}

          {activeTab === 'reviews' && data.map(item => (
            <div key={item.id} className="bg-[#F5F2ED] rounded-3xl p-8 flex flex-col h-full border border-black/5">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= item.rating ? 'fill-[#8C7A5B] text-[#8C7A5B]' : 'text-black/10'}`} />
                ))}
              </div>
              <p className="text-xl font-serif italic text-text-dark leading-relaxed mb-6 flex-1">
                "{item.review_text}"
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <Link href={`/${item.lists ? 'lists' : 'items'}/${item.lists?.id || item.items?.id}`} className="text-[10px] font-bold uppercase tracking-wider text-text-dark hover:underline">
                  {item.lists?.title || item.items?.title || 'Ver publicación'}
                </Link>
                <span className="text-[10px] text-text-dark/40">Hace poco</span>
              </div>
            </div>
          ))}

          {activeTab === 'comments' && data.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 h-full flex flex-col">
              <div className="text-[10px] text-text-dark/40 font-bold uppercase tracking-wider mb-3">Comentario</div>
              <p className="text-text-dark text-sm mb-4 flex-1">
                {item.content}
              </p>
              <div className="pt-4 border-t border-black/5">
                <Link href={`/${item.lists ? 'lists' : 'items'}/${item.lists?.id || item.items?.id}`} className="text-[10px] font-bold uppercase tracking-wider text-bg-primary hover:underline line-clamp-1">
                  En: {item.lists?.title || item.items?.title || item.list_items?.description || 'Publicación'}
                </Link>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}
