'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, AlertTriangle, User } from 'lucide-react'
import CommentSection from '@/components/comments/CommentSection'
import ReviewSection from '@/components/reviews/ReviewSection'

interface DetailPanelProps {
  type: 'list' | 'item'
  id: string
}

export default function DetailPanel({ type, id }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info')

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-bg-page overflow-hidden pt-16">
      {/* Header Info */}
      <div className="px-6 py-4 border-b border-border-dark/10">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-2 block">
              {type === 'list' ? 'Lista' : 'Review'}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-text-dark leading-tight">
              {type === 'list' 
                ? 'Información de la lista seleccionada' 
                : 'Detalle de la reseña y opiniones'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors text-text-dark/60 hover:text-text-dark">
              <Share2 size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors text-text-dark/60 hover:text-text-dark">
              <Heart size={20} />
            </button>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-8 h-8 rounded-full bg-text-dark/10 flex items-center justify-center">
            <User size={16} className="text-text-dark/40" />
          </div>
          <p className="text-sm text-text-dark/80">
            Creado por <a href={`/profile/demo_user`} className="font-semibold hover:underline">@demo_user</a>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-dark/10">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'info' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}
        >
          Información
          {activeTab === 'info' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 ${activeTab === 'comments' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}
        >
          <MessageCircle size={16} />
          Comentarios
          {activeTab === 'comments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <div className="p-6">
            <p className="text-text-dark/70 leading-relaxed">
              Aquí se mostrará toda la descripción adicional, ubicación (si aplica), y otros metadatos sobre este {type === 'list' ? 'grupo de recomendaciones' : 'elemento particular'}.
            </p>
            {type === 'item' && (
              <div className="mt-8 border-t border-border-dark/10 pt-8 pb-4">
                <ReviewSection targetId={id} />
                
                {/* Mockup de Reviews pasadas */}
                <div className="mt-8">
                  <h4 className="font-serif text-lg text-text-dark mb-4">Reseñas recientes</h4>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-border-dark/5 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-text-dark">@sommelier_ana</span>
                        <span className="text-xs text-text-dark/40">hace 2 días</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= 4 ? "#1a1a1a" : "none"} stroke="#1a1a1a" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        ))}
                      </div>
                      <p className="text-sm text-text-dark/80">Me pareció increíble la atención y el producto final. Volvería sin dudarlo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <CommentSection targetType={type} targetId={id} />
          </div>
        )}
      </div>
    </div>
  )
}
