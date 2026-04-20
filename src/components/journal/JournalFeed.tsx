'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageSquare, Star, UserPlus } from 'lucide-react'
import { ActivityItem } from '@/app/actions/journal'

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMins < 60) return `${diffInMins} MINS AGO`
  if (diffInHours < 24) return `${diffInHours} HOURS AGO`
  if (diffInDays === 1) return 'YESTERDAY'
  return `${diffInDays} DAYS AGO`
}

export default function JournalFeed({ feed }: { feed: ActivityItem[] }) {
  if (!feed || feed.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-xl font-serif italic text-text-dark/40">
          Todo está tranquilo por ahora...
        </p>
      </div>
    )
  }

  return (
    <div className="relative border-l border-black/10 pl-8 pb-12 ml-3">
      {feed.map((item, idx) => (
        <div key={item.id} className={`relative ${idx !== feed.length - 1 ? 'mb-16' : ''}`}>
          
          {/* Timeline Dot */}
          <div className="absolute -left-[37px] top-1 w-[10px] h-[10px] rounded-full bg-[#E5E0D8]" />

          {/* Activity Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/${item.userProfile.username}`} className="w-8 h-8 rounded-full overflow-hidden bg-black/5 shrink-0 block relative">
                {item.userProfile.avatar_url ? (
                  <Image src={item.userProfile.avatar_url} alt={item.userProfile.username} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-primary font-serif text-xs">
                    {(item.userProfile.display_name || item.userProfile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="text-sm">
                <Link href={`/${item.userProfile.username}`} className="font-semibold text-text-dark hover:underline">
                  {item.userProfile.display_name || `@${item.userProfile.username}`}
                </Link>
                <span className="text-text-dark/60 ml-1">
                  {item.type === 'list_created' && `created a new list : `}
                  {item.type === 'item_created' && `added an item : `}
                  {item.type === 'rating' && `rated `}
                  {item.type === 'comment' && `shared a new insight on `}
                  {item.type === 'follow' && `followed `}
                </span>
                {(item.type === 'rating' || item.type === 'comment' || item.type === 'list_created' || item.type === 'item_created') && item.targetTitle && (
                  <span className="text-text-dark">{item.targetTitle}</span>
                )}
                {item.type === 'follow' && item.followingUsername && (
                  <Link href={`/${item.followingUsername}`} className="font-semibold text-text-dark hover:underline">
                    @{item.followingUsername}
                  </Link>
                )}
              </div>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-text-dark/40 uppercase shrink-0">
              {formatRelativeTime(item.createdAt)}
            </div>
          </div>

          {/* Activity Content (Card) */}
          {item.type === 'follow' ? null : item.type === 'comment' ? (
            // Formato de Comment (insight sin tarjeta gris)
            <div className="pl-11 mb-4">
              <p className="text-xl font-serif italic text-text-dark mb-4">
                "{item.content}"
              </p>
            </div>
          ) : (
            // Formato Card para Listas, Items y Ratings
            <Link 
              href={`/${item.type.includes('list') ? 'lists' : 'items'}/${item.targetId}`}
              className="block mb-4 ml-11 bg-[#F9F7F4] hover:bg-[#F2EFEA] transition-colors rounded-2xl p-5 border border-black/5"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Imagen */}
                {item.targetImage ? (
                  <div className="w-full sm:w-32 h-40 sm:h-auto shrink-0 relative rounded-xl overflow-hidden bg-black/5">
                    <Image src={item.targetImage} alt={item.targetTitle || ''} fill className="object-cover" />
                    {item.type === 'list_created' && (
                      <div className="absolute bottom-2 right-2 bg-white px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-wider uppercase shadow-sm">
                        LIST
                      </div>
                    )}
                  </div>
                ) : item.type === 'list_created' || item.type === 'item_created' ? (
                  <div className="w-full sm:w-32 h-40 sm:h-auto shrink-0 relative rounded-xl overflow-hidden bg-[#E5E0D8]">
                    {item.type === 'list_created' && (
                      <div className="absolute bottom-2 right-2 bg-white px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-wider uppercase shadow-sm">
                        LIST
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Textos */}
                <div className="flex-1 py-1">
                  {/* Si es rating mostramos estrellitas */}
                  {item.type === 'rating' && item.rating && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= item.rating! ? 'fill-[#8C7A5B] text-[#8C7A5B]' : 'text-black/10'}`} />
                        ))}
                      </div>
                      <span className="font-serif font-bold text-lg leading-none">{item.rating.toFixed(1)}</span>
                    </div>
                  )}

                  <h3 className="text-xl font-serif text-text-dark mb-2">
                    {item.targetTitle}
                  </h3>

                  {(item.reviewText || item.targetDescription) && (
                    <p className="text-sm text-text-dark/60 leading-relaxed line-clamp-3">
                      {item.type === 'rating' ? `"${item.reviewText}"` : item.targetDescription}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-6 ml-11">
            <button className="flex items-center gap-2 text-text-dark/60 hover:text-text-dark transition-colors text-xs font-semibold">
              <Heart className="w-4 h-4" /> Like
            </button>
            <button className="flex items-center gap-2 text-text-dark/60 hover:text-text-dark transition-colors text-xs font-semibold">
              <MessageSquare className="w-4 h-4" /> Comment
            </button>
          </div>

        </div>
      ))}
      
      {feed.length > 0 && (
        <div className="mt-12 text-center">
          <button className="text-xs font-bold tracking-widest text-text-dark/40 uppercase pb-1 border-b border-text-dark/20 hover:text-text-dark hover:border-text-dark transition-colors">
            LOAD OLDER ENTRIES
          </button>
        </div>
      )}
    </div>
  )
}
