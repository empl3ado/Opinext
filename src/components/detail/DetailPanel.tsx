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
            <p className="text-text-dark/70 leading-relaxed italic text-sm">
              No hay más información disponible por el momento.
            </p>
            {type === 'item' && (
              <div className="mt-8 border-t border-border-dark/10 pt-8 pb-4">
                <ReviewSection targetId={id} />
                <div className="mt-8 text-center text-text-dark/40 text-sm font-medium">
                  No hay reseñas para mostrar.
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
