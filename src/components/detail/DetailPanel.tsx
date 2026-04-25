'use client'

import { useState, useEffect } from 'react'
import { Share2, Loader2, User, Star, Bookmark, Eye } from 'lucide-react'
import ListItemsSection from '@/components/lists/ListItemsSection'
import CommentSection from '@/components/comments/CommentSection'
import ReviewSection from '@/components/reviews/ReviewSection'
import StarRating from '@/components/ui/StarRating'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

interface DetailPanelProps {
  type: 'list' | 'item'
  id: string
}

export default function DetailPanel({ type, id }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const table = type === 'list' ? 'lists' : 'items'
      const { data: result } = await supabase
        .from(table)
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('id', id)
        .single()

      setData(result)
      setLoading(false)
    }
    if (id) fetchData()
  }, [id, type, supabase])

  if (loading) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-[#FAF9F6] pt-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#B8A080]" />
          <p className="text-xs text-text-dark/30 tracking-widest uppercase">Cargando</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-[#FAF9F6] pt-16">
        <p className="text-sm text-text-dark/40">No se encontró el contenido.</p>
      </div>
    )
  }

  const isOwner = user?.id === data?.user_id
  const username = data?.profiles?.username || 'usuario'

  /* ─── LIST VIEW ─── */
  if (type === 'list') {
    return (
      <div className="w-full h-[100dvh] flex flex-col bg-[#FAF9F6] overflow-hidden pt-16">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-dark/10 bg-white/60 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#B8A080] uppercase mb-2">
                Lista{data.is_collaborative ? ' · Colaborativa' : ''}
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-text-dark leading-tight">
                {data.title}
              </h2>
              {data.description && (
                <p className="text-sm text-text-dark/60 mt-2 leading-relaxed line-clamp-3">
                  {data.description}
                </p>
              )}
            </div>
            <button className="p-2.5 rounded-xl hover:bg-black/4 transition-colors text-text-dark/30 hover:text-text-dark/60 shrink-0">
              <Share2 size={18} />
            </button>
          </div>

          {/* Author + rating summary */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-dark/10">
            <a href={`/profile/${username}`} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#E5E0D8] overflow-hidden flex items-center justify-center shrink-0">
                {data?.profiles?.avatar_url
                  ? <img src={data.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-[11px] font-bold text-text-dark/50">{username[0]?.toUpperCase()}</span>
                }
              </div>
              <span className="text-sm text-text-dark/70 group-hover:text-text-dark group-hover:underline transition-colors">
                @{username}
              </span>
            </a>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-text-dark">{Number(data?.avg_rating || 0).toFixed(1)}</span>
                <span className="text-xs text-text-dark/40">({data?.rating_count || 0})</span>
              </div>
              {data.view_count > 0 && (
                <div className="flex items-center gap-1 text-xs text-text-dark/30">
                  <Eye size={12} />
                  {data.view_count}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable content — just the items */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6">
            <ListItemsSection
              listId={id}
              isCollaborative={data?.is_collaborative || false}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    )
  }

  /* ─── ITEM VIEW ─── */
  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#FAF9F6] overflow-hidden pt-16">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border-dark/10 bg-white/60 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#B8A080] uppercase mb-2">Review</p>
            <h2 className="font-serif text-2xl md:text-3xl text-text-dark leading-tight">
              {data.title}
            </h2>
          </div>
          <button className="p-2.5 rounded-xl hover:bg-black/4 transition-colors text-text-dark/30 hover:text-text-dark/60 shrink-0">
            <Share2 size={18} />
          </button>
        </div>

        {/* Author + rating */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-dark/10">
          <a href={`/profile/${username}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#E5E0D8] overflow-hidden flex items-center justify-center shrink-0">
              {data?.profiles?.avatar_url
                ? <img src={data.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-[11px] font-bold text-text-dark/50">{username[0]?.toUpperCase()}</span>
              }
            </div>
            <span className="text-sm text-text-dark/70 group-hover:text-text-dark group-hover:underline transition-colors">
              @{username}
            </span>
          </a>

          <div className="flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-text-dark">{Number(data?.avg_rating || 0).toFixed(1)}</span>
            <span className="text-xs text-text-dark/40">({data?.rating_count || 0})</span>
          </div>
        </div>
      </div>

      {/* Tabs — items keep review + comments */}
      <div className="flex bg-white/60 backdrop-blur-sm border-b border-border-dark/10">
        {(['info', 'comments'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors relative ${activeTab === tab ? 'text-text-dark' : 'text-text-dark/30 hover:text-text-dark/50'}`}>
            {tab === 'info' ? 'Reseña' : 'Comentarios'}
            {activeTab === tab && <div className="absolute bottom-0 inset-x-4 h-[2px] bg-text-dark rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <div className="p-5 md:p-6 space-y-6">
            {data?.content && (
              <p className="text-text-dark/80 text-sm leading-relaxed whitespace-pre-wrap">{data.content}</p>
            )}
            <ReviewSection targetId={id} targetType="item" />
          </div>
        ) : (
          <div className="p-5 md:p-6">
            <CommentSection targetType="item" targetId={id} />
          </div>
        )}
      </div>
    </div>
  )
}
