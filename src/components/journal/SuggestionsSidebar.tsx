'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Wine, Watch, BookOpen } from 'lucide-react'

interface SuggestionProfile {
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
}

export default function SuggestionsSidebar({ 
  suggestions, 
  isAuthenticated 
}: { 
  suggestions: SuggestionProfile[],
  isAuthenticated: boolean
}) {

  // Datos mockeados de trending circles como se ven en el diseño
  const trendingCircles = [
    { id: 1, name: 'Bordeaux En Primeur', members: '342 Members', active: '12 Active', icon: Wine },
    { id: 2, name: 'Horology & Complications', members: '1.2k Members', active: '45 Active', icon: Watch },
    { id: 3, name: 'First Editions', members: '890 Members', active: '8 Active', icon: BookOpen },
  ]

  return (
    <div className="space-y-12">
      
      {/* Trending Circles */}
      <div>
        <h3 className="text-xl font-serif text-text-dark mb-6">Trending Circles</h3>
        <div className="space-y-5">
          {trendingCircles.map(circle => (
            <div key={circle.id} className="flex items-center gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-text-dark shrink-0 group-hover:bg-black/10 transition-colors">
                <circle.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-dark leading-tight group-hover:underline">
                  {circle.name}
                </h4>
                <p className="text-[10px] text-text-dark/60 tracking-wider">
                  {circle.members} • {circle.active}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Critics */}
      <div>
        <h3 className="text-xl font-serif text-text-dark mb-6">Recommended Critics</h3>
        
        {suggestions.length === 0 ? (
          <p className="text-sm italic text-text-dark/50">No hay recomendaciones en este momento.</p>
        ) : (
          <div className="space-y-6">
            {suggestions.map(profile => (
              <div key={profile.username} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Link href={`/${profile.username}`} className="w-10 h-10 rounded-full bg-black/5 shrink-0 overflow-hidden relative block">
                    {profile.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-primary font-serif text-sm">
                        {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="truncate">
                    <Link href={`/${profile.username}`} className="text-sm font-semibold text-text-dark leading-tight hover:underline truncate block">
                      {profile.display_name || `@${profile.username}`}
                    </Link>
                    <p className="text-[10px] text-text-dark/60 tracking-wider truncate">
                      {profile.bio || 'Curator'}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <button className="shrink-0 px-4 py-1.5 rounded-full border border-black/10 text-[10px] font-bold tracking-widest uppercase text-text-dark hover:bg-black/5 transition-colors">
                    FOLLOW
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-12 text-center border-t border-black/5">
        <p className="font-serif italic text-sm text-text-dark/40">
          The Estate © {new Date().getFullYear()}
        </p>
      </div>
      
    </div>
  )
}
