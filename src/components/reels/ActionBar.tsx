'use client'

import { ThumbsUp, ThumbsDown, Bookmark, Share2, Flag } from 'lucide-react'

interface ActionBarProps {
  upvotes: number
  downvotes: number
  saves: number
  isLiked?: boolean
  isDisliked?: boolean
  isSaved?: boolean
  onLike?: () => void
  onDislike?: () => void
  onSave?: () => void
  onShare?: () => void
  onReport?: () => void
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

export default function ActionBar({
  upvotes,
  downvotes,
  saves,
  isLiked = false,
  isDisliked = false,
  isSaved = false,
  onLike,
  onDislike,
  onSave,
  onShare,
  onReport,
}: ActionBarProps) {
  const actions = [
    {
      id: 'action-like',
      icon: ThumbsUp,
      count: upvotes,
      active: isLiked,
      onClick: onLike,
    },
    {
      id: 'action-dislike',
      icon: ThumbsDown,
      count: undefined,
      active: isDisliked,
      onClick: onDislike,
    },
    {
      id: 'action-save',
      icon: Bookmark,
      count: saves,
      active: isSaved,
      onClick: onSave,
    },
    {
      id: 'action-share',
      icon: Share2,
      count: undefined,
      active: false,
      onClick: onShare,
    },
    {
      id: 'action-report',
      icon: Flag,
      count: undefined,
      active: false,
      onClick: onReport,
      className: 'mt-4',
    },
  ]

  return (
    <div className="flex flex-col items-center gap-5">
      {actions.map(({ id, icon: Icon, count, active, onClick, className }) => (
        <button
          key={id}
          id={id}
          onClick={onClick}
          className={`flex flex-col items-center gap-1 group transition-all ${className || ''}`}
        >
          <div
            className={`p-2.5 rounded-full transition-all duration-200 ${
              active
                ? 'bg-white/20 text-text-secondary'
                : 'bg-white/8 hover:bg-white/15 text-text-primary/70 hover:text-text-primary'
            }`}
          >
            <Icon
              size={22}
              className={`transition-transform group-hover:scale-110 ${
                active ? 'fill-current' : ''
              }`}
            />
          </div>
          {count !== undefined && (
            <span className="text-xs text-text-primary/60 font-medium">
              {formatCount(count)}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
