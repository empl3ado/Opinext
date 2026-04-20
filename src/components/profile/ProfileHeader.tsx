'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal, UserPlus, Check, UserMinus, ShieldAlert, Ban } from 'lucide-react'
import { ProfileData, toggleFollow, sendFriendRequest, acceptFriendRequest, removeFriendship, toggleBlock } from '@/app/actions/profile'
import ReportModal from './ReportModal'

interface ProfileHeaderProps {
  profile: ProfileData
  isCurrentUser: boolean
}

export default function ProfileHeader({ profile: initialProfile, isCurrentUser }: ProfileHeaderProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handlers
  const handleFollow = async () => {
    setIsLoading(true)
    const res = await toggleFollow(profile.id, profile.username)
    if (res.success) {
      setProfile(p => ({
        ...p,
        isFollowing: !p.isFollowing,
        followers_count: p.isFollowing ? p.followers_count - 1 : p.followers_count + 1
      }))
    }
    setIsLoading(false)
  }

  const handleFriendAction = async () => {
    setIsLoading(true)
    let res
    if (profile.friendshipStatus === 'none' || profile.friendshipStatus === 'pending_received') {
      // Send request or accept if we received one (for simplicity, we assume sendFriendRequest handles both or we'd call acceptFriendRequest)
      res = profile.friendshipStatus === 'pending_received' 
        ? await acceptFriendRequest(profile.id, profile.username)
        : await sendFriendRequest(profile.id, profile.username)
        
      if (res.success) {
        setProfile(p => ({
          ...p,
          friendshipStatus: p.friendshipStatus === 'pending_received' ? 'accepted' : 'pending_sent'
        }))
      }
    } else {
      res = await removeFriendship(profile.id, profile.username)
      if (res.success) {
        setProfile(p => ({ ...p, friendshipStatus: 'none' }))
      }
    }
    setIsLoading(false)
  }

  const handleBlock = async () => {
    setIsMenuOpen(false)
    setIsLoading(true)
    const res = await toggleBlock(profile.id, profile.username)
    if (res.success) {
      setProfile(p => ({
        ...p,
        isBlocked: !p.isBlocked,
        isFollowing: false,
        friendshipStatus: 'none'
      }))
    }
    setIsLoading(false)
  }

  // Render friend button text/icon
  const getFriendButtonContent = () => {
    switch (profile.friendshipStatus) {
      case 'accepted': return <><Check className="w-4 h-4" /> Amigos</>
      case 'pending_sent': return <span className="opacity-70">Pendiente</span>
      case 'pending_received': return 'Aceptar Solicitud'
      default: return <><UserPlus className="w-4 h-4" /> Agregar Amigo</>
    }
  }

  return (
    <div className="pt-24 pb-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
        
        {/* Avatar */}
        <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-[2rem] overflow-hidden bg-black/5 relative shadow-xl">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-primary text-text-primary text-6xl font-serif">
              {(profile.display_name || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-text-dark tracking-tight leading-none mb-3">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-xl italic text-text-dark/60 font-serif">
                {profile.bio || `@${profile.username}`}
              </p>
            </div>

            {/* Acciones */}
            {!isCurrentUser && !profile.isBlocked && (
              <div className="flex items-center gap-3 relative">
                <button 
                  onClick={handleFollow}
                  disabled={isLoading}
                  className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                    profile.isFollowing 
                      ? 'bg-black/5 text-text-dark hover:bg-black/10' 
                      : 'bg-bg-primary text-text-primary hover:bg-bg-primary/90 shadow-md'
                  }`}
                >
                  {profile.isFollowing ? 'SIGUIENDO' : 'SEGUIR'}
                </button>
                
                <button 
                  onClick={handleFriendAction}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-full font-semibold text-sm border border-black/10 text-text-dark flex items-center gap-2 hover:bg-black/5 transition-colors"
                >
                  {getFriendButtonContent()}
                </button>

                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2.5 rounded-full border border-black/10 text-text-dark hover:bg-black/5 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden z-50">
                    <button 
                      onClick={handleBlock}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-black/5 transition-colors text-text-dark"
                    >
                      <Ban className="w-4 h-4" /> Bloquear
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); setIsReportModalOpen(true); }}
                      className="w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" /> Reportar Perfil
                    </button>
                  </div>
                )}
              </div>
            )}

            {isCurrentUser && (
              <button className="px-6 py-2.5 rounded-full font-semibold text-sm border border-black/10 text-text-dark hover:bg-black/5 transition-colors">
                EDITAR PERFIL
              </button>
            )}
          </div>

          {profile.isBlocked ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl max-w-fit">
              Has bloqueado a este usuario.
              <button onClick={handleBlock} className="ml-4 font-bold underline">Desbloquear</button>
            </div>
          ) : (
            <div className="flex items-center gap-8 md:gap-12 pt-4">
              <div className="text-center">
                <div className="text-3xl font-serif text-text-dark mb-1">{profile.followers_count}</div>
                <div className="text-[10px] font-bold tracking-[0.15em] text-text-dark/40 uppercase">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-serif text-text-dark mb-1">{profile.following_count}</div>
                <div className="text-[10px] font-bold tracking-[0.15em] text-text-dark/40 uppercase">Following</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-serif text-text-dark mb-1">{profile.rating_avg > 0 ? profile.rating_avg.toFixed(1) : '-'}</div>
                <div className="text-[10px] font-bold tracking-[0.15em] text-text-dark/40 uppercase">Ratings</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={profile.id}
        targetType="profile"
        targetName={profile.display_name || profile.username}
      />
    </div>
  )
}
