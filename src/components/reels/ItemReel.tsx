'use client'

import ActionBar from './ActionBar'
import StarRating from '@/components/ui/StarRating'
import { MessageSquare } from 'lucide-react'

interface ItemReelProps {
  item: {
    id: string
    title: string
    content: string
    image_url: string | null
    avg_rating: number
    rating_count: number
    upvotes: number
    downvotes: number
    saves: number
    user: {
      username: string
      avatar_url: string | null
    }
    preview_comments: Array<{
      username: string
      content: string
    }>
    created_at: string
  }
  onOpenDetail: () => void
}

export default function ItemReel({ item, onOpenDetail }: ItemReelProps) {
  const timeAgo = getTimeAgo(item.created_at)

  return (
    <div className="carousel-slide relative h-full">
      {/* Background image */}
      <div className="absolute inset-0">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
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
                  {item.user.username[0]?.toUpperCase()}
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
          <div className="mb-5">
            <StarRating
              rating={item.avg_rating}
              count={item.rating_count}
              size={20}
            />
          </div>

          {/* Preview comments */}
          <div className="glass-dark rounded-xl px-4 py-3 max-w-lg space-y-2">
            {item.preview_comments.map((comment, i) => (
              <p key={i} className="text-xs text-text-primary/70">
                <span className="text-text-secondary font-medium">@{comment.username}</span>
                {' '}{comment.content}
              </p>
            ))}

            {/* Opinar button */}
            <button
              onClick={onOpenDetail}
              className="w-full mt-2 py-2.5 rounded-lg bg-white/8 hover:bg-white/12 transition-colors flex items-center justify-center gap-2 text-text-primary text-sm font-medium tracking-wide"
            >
              <MessageSquare size={16} />
              OPINAR
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-end pb-28 pr-4 md:pr-8">
          <ActionBar
            upvotes={item.upvotes}
            downvotes={item.downvotes}
            saves={item.saves}
          />
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
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
