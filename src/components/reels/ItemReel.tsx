'use client'

import { useState, useEffect } from 'react'
import ActionBar from './ActionBar'
import StarRating from '@/components/ui/StarRating'
import { MessageSquare, Loader2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { toggleVote, toggleSave, submitReview } from '@/app/actions/social'
import CommentSection from '@/components/comments/CommentSection'

interface ItemReelProps {
  item: any
  onOpenDetail: () => void
}

export default function ItemReel({ item, onOpenDetail }: ItemReelProps) {
  const { user } = useAuth()
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [upvotes, setUpvotes] = useState(item.upvotes || 0)
  const [downvotes, setDownvotes] = useState(item.downvotes || 0)
  const [isSaved, setIsSaved] = useState(false)
  const [savesCount, setSavesCount] = useState(item.saves || 0)
  const [rating, setRating] = useState(item.avg_rating || 0)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const timeAgo = getTimeAgo(item.created_at)

  useEffect(() => {
    const fetchState = async () => {
      if (!user) return
      const supabase = createClient()
      
      // Vote
      const { data: vData } = await supabase.from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('target_type', 'item')
        .eq('target_id', item.id)
        .single()
      if (vData) setVote(vData.vote_type)

      // Save
      const { data: sData } = await supabase.from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'item')
        .eq('target_id', item.id)
        .single()
      setIsSaved(!!sData)
    }

    // Fetch total saves count (since item.saves might be outdated)
    const fetchSavesCount = async () => {
      const supabase = createClient()
      const { count } = await supabase.from('saves')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'item')
        .eq('target_id', item.id)
      setSavesCount(count || 0)
    }

    fetchState()
    fetchSavesCount()
  }, [item.id, user])

  const handleLike = async () => {
    if (!user) return
    const prev = vote
    setVote(vote === 'up' ? null : 'up')
    if (vote === 'up') setUpvotes((u: number) => u - 1)
    else {
      setUpvotes((u: number) => u + 1)
      if (prev === 'down') setDownvotes((d: number) => d - 1)
    }
    const res = await toggleVote('item', item.id, 'up')
    if (res?.error) setVote(prev)
  }

  const handleDislike = async () => {
    if (!user) return
    const prev = vote
    setVote(vote === 'down' ? null : 'down')
    if (vote === 'down') setDownvotes((d: number) => d - 1)
    else {
      setDownvotes((d: number) => d + 1)
      if (prev === 'up') setUpvotes((u: number) => u - 1)
    }
    const res = await toggleVote('item', item.id, 'down')
    if (res?.error) setVote(prev)
  }

  const handleSave = async () => {
    if (!user) return
    const prev = isSaved
    setIsSaved(!isSaved)
    setSavesCount((s: number) => isSaved ? s - 1 : s + 1)
    const res = await toggleSave('item', item.id)
    if (res?.error) {
      setIsSaved(prev)
      setSavesCount((s: number) => prev ? s + 1 : s - 1)
    }
  }

  const handleRate = async (score: number) => {
    if (!user || score === 0) return
    setRating(score)
    setRatingBusy(true)
    const fd = new FormData()
    fd.append('targetId', item.id)
    fd.append('targetType', 'item')
    fd.append('rating', score.toString())
    await submitReview(fd)
    setRatingBusy(false)
  }

  return (
    <div className="carousel-slide relative h-full">
      {/* Background image */}
      <div className="absolute inset-0">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        )}
        <div className="gradient-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative h-full flex">
        <div className="flex-1 flex flex-col justify-end pb-8 px-8 md:px-16 max-w-3xl">
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-text-secondary/30 overflow-hidden flex items-center justify-center">
              {item.user.avatar_url ? (
                <img src={item.user.avatar_url} alt={item.user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-text-primary font-semibold">
                  {item.user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="text-text-primary text-sm font-medium">
                @{item.user.username}
              </p>
              <p className="text-text-primary/50 text-xs">{timeAgo}</p>
            </div>
          </div>

          {/* Title / Content */}
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary leading-tight mb-4">
            {item.title || item.content}
          </h2>

          {/* Star rating */}
          <div className="flex items-center gap-3 mb-5">
            <StarRating
              rating={rating}
              size={20}
              interactive={!!user}
              onRate={handleRate}
            />
            {ratingBusy && <Loader2 size={14} className="animate-spin text-white/30" />}
          </div>

          {/* Opinar button / Comments Toggle */}
          <div className="max-w-lg">
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full py-2.5 rounded-lg glass hover:bg-white/12 transition-colors flex items-center justify-center gap-2 text-text-primary text-sm font-medium tracking-wide border border-white/10"
            >
              <MessageSquare size={16} />
              {showComments ? 'OCULTAR COMENTARIOS' : 'VER OPINIONES'}
            </button>
            
            {showComments && (
              <div className="mt-4 p-4 glass rounded-xl max-h-[40vh] overflow-y-auto custom-scrollbar">
                <CommentSection targetType="item" targetId={item.id} />
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-end pb-28 pr-4 md:pr-8">
          <ActionBar
            upvotes={upvotes}
            downvotes={downvotes}
            saves={savesCount}
            isLiked={vote === 'up'}
            isDisliked={vote === 'down'}
            isSaved={isSaved}
            onLike={handleLike}
            onDislike={handleDislike}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  if (!dateStr) return 'Reciente'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
