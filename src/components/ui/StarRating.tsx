'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'

interface StarRatingProps {
  rating: number
  count?: number
  interactive?: boolean
  onRate?: (score: number) => void
  size?: number
}

export default function StarRating({
  rating,
  count,
  interactive = false,
  onRate,
  size = 18,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [currentRating, setCurrentRating] = useState(rating)

  const displayRating = hoverRating !== null ? hoverRating : currentRating

  const handleClick = (starIndex: number) => {
    if (!interactive) return

    let newRating: number
    if (currentRating === starIndex) {
      // Click same star again: decrease by 0.5
      newRating = starIndex - 0.5
    } else if (currentRating === starIndex - 0.5) {
      // Already at half, go to previous full star
      newRating = starIndex - 1
    } else {
      newRating = starIndex
    }

    if (newRating < 0.5) newRating = 0
    setCurrentRating(newRating)
    onRate?.(newRating)
  }

  const handleClear = () => {
    setCurrentRating(0)
    onRate?.(0)
  }

  const renderStar = (index: number) => {
    const starNumber = index + 1
    const fillPercentage = Math.min(1, Math.max(0, displayRating - index)) * 100

    return (
      <button
        key={index}
        type="button"
        onClick={() => handleClick(starNumber)}
        onMouseEnter={() => interactive && setHoverRating(starNumber)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} transition-transform ${
          interactive ? 'hover:scale-110' : ''
        }`}
        disabled={!interactive}
      >
        {/* Empty star (background) */}
        <Star
          size={size}
          className="text-text-primary/30"
          strokeWidth={1.5}
        />
        {/* Filled star (overlay with clip) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${fillPercentage}%` }}
        >
          <Star
            size={size}
            className="text-text-secondary fill-text-secondary"
            strokeWidth={1.5}
          />
        </div>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {count !== undefined && (
        <span className="text-text-primary/70 text-sm ml-1">
          {displayRating.toFixed(1)}
        </span>
      )}
      {interactive && currentRating > 0 && (
        <button
          onClick={handleClear}
          className="ml-1 p-0.5 rounded-full hover:bg-white/10 transition-colors"
          title="Vaciar puntaje"
        >
          <X size={14} className="text-text-primary/50" />
        </button>
      )}
    </div>
  )
}
