'use client'

import ActionBar from './ActionBar'

interface ListReelProps {
  list: {
    id: string
    title: string
    description: string
    cover_image_url: string | null
    user: {
      username: string
      avatar_url: string | null
    }
    upvotes: number
    downvotes: number
    saves: number
    featured_comment?: {
      username: string
      content: string
    }
  }
  onOpenDetail: () => void
}

export default function ListReel({ list, onOpenDetail }: ListReelProps) {
  return (
    <div className="carousel-slide relative h-full">
      {/* Background image */}
      <div className="absolute inset-0">
        {list.cover_image_url ? (
          <img
            src={list.cover_image_url}
            alt={list.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        )}
        <div className="gradient-overlay absolute inset-0" />
      </div>

      {/* Content overlay */}
      <div className="relative h-full flex">
        {/* Main content - left side */}
        <div className="flex-1 flex flex-col justify-end pb-24 px-8 md:px-16 max-w-3xl">
          {/* Author info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-text-secondary/30 overflow-hidden flex items-center justify-center">
              {list.user.avatar_url ? (
                <img src={list.user.avatar_url} alt={list.user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-text-primary text-sm font-semibold">
                  {list.user.username[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-text-primary/60 text-xs uppercase tracking-widest">
                @{list.user.username} · Colección
              </p>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-3">
            {list.title}
          </h2>

          {/* Description */}
          <p className="text-text-primary/70 text-sm md:text-base max-w-lg mb-6 line-clamp-2">
            {list.description}
          </p>

          {/* CTA Button */}
          <button
            onClick={onOpenDetail}
            className="self-start px-6 py-2.5 glass-dark rounded-lg text-text-primary text-sm font-medium tracking-wide hover:bg-white/15 transition-all flex items-center gap-2"
          >
            VER LISTA COMPLETA
            <span className="text-lg">→</span>
          </button>

          {/* Featured comment */}
          {list.featured_comment && (
            <div className="mt-6 glass-dark rounded-xl px-4 py-3 max-w-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-text-secondary">
                    {list.featured_comment.username[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-text-secondary text-xs font-medium">
                  @{list.featured_comment.username}
                </span>
              </div>
              <p className="text-text-primary/70 text-xs mt-1.5 line-clamp-1">
                {list.featured_comment.content}
              </p>
            </div>
          )}
        </div>

        {/* Action bar - right side */}
        <div className="flex items-end pb-28 pr-4 md:pr-8">
          <ActionBar
            upvotes={list.upvotes}
            downvotes={list.downvotes}
            saves={list.saves}
          />
        </div>
      </div>
    </div>
  )
}
