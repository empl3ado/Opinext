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
  return (
    <div className="space-y-12">

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
