'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle,
  Star, Eye, Bookmark, Heart, Share2, UserPlus, Send,
  ChevronDown, ChevronUp, Loader2, Image as ImageIcon, X, Flag, Ban, Edit2, Trash2, MoreVertical,
  ArrowDownNarrowWide, ArrowUpNarrowWide, Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getListItems, createListItem, deleteListItem, updateListItem } from '@/app/actions/lists'
import { toggleVote, toggleSave, addComment, submitReview, submitReport, updateComment, deleteComment } from '@/app/actions/social'
import { toggleFollow, toggleBlock } from '@/app/actions/profile'
import StarRating from '@/components/ui/StarRating'

interface ListReelProps {
  list: any
  onOpenDetail: () => void
}

/* helpers */
function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime()
  const m = Math.floor(ms / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (dy < 7) return `${dy}d`
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
function fmt(n: number) { return n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'k' : String(n) }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) }

async function handleFollow(targetId: string, targetUsername: string, user: any, setter: (fn: (v: boolean) => boolean) => void) {
  if (!user) return
  const res = await toggleFollow(targetId, targetUsername)
  if (!res.error) setter(prev => !prev)
}

async function handleBlock(targetId: string, targetUsername: string, user: any, setter: (fn: (v: boolean) => boolean) => void) {
  if (!user) return
  if (!confirm('¿Estás seguro de bloquear a este usuario?')) return
  const res = await toggleBlock(targetId, targetUsername)
  if (!res.error) setter(prev => !prev)
}

export default function ListReel({ list }: ListReelProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loadingItems, setLoadingItems] = useState(true)

  const username = list.user?.username || 'usuario'
  const avatarUrl = list.user?.avatar_url
  const bio = list.user?.bio
  const displayName = list.user?.display_name || username
  const isOwner = user?.id === list.user_id
  const canAdd = isOwner || list.is_collaborative
  
  const [listVote, setListVote] = useState<'up'|'down'|null>(null)
  const [listUps, setListUps] = useState(list.upvotes || 0)
  const [listDowns, setListDowns] = useState(list.downvotes || 0)
  const [listSaved, setListSaved] = useState(false)
  const [listSavesCount, setListSavesCount] = useState(0)
  const [listCommentCount, setListCommentCount] = useState(0)
  const [showListComments, setShowListComments] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string|null>(null)
  const [sortBy, setSortBy] = useState<'score'|'likes'|'date'>('score')
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc')

  const handleListVote = async (type: 'up'|'down') => {
    if (!user) return
    const prev = listVote
    setListVote(listVote === type ? null : type)
    if (type === 'up') {
      if (prev === 'up') setListUps((u: number) => u-1)
      else { setListUps((u: number) => u+1); if (prev === 'down') setListDowns((d: number) => d-1) }
    } else {
      if (prev === 'down') setListDowns((d: number) => d-1)
      else { setListDowns((d: number) => d+1); if (prev === 'up') setListUps((u: number) => u-1) }
    }
    const res = await toggleVote('list', list.id, type)
    if (res?.error) setListVote(prev)
  }

  const handleListSave = async () => {
    if (!user) return
    const prev = listSaved
    setListSaved(!listSaved)
    const res = await toggleSave('list', list.id)
    if (res?.error) setListSaved(prev)
  }
  


  useEffect(() => {
    const applySort = (data: any[]) => {
      let sorted = [...data]
      if (sortBy === 'score') {
        sorted.sort((a, b) => sortOrder === 'desc' ? b.avg_rating - a.avg_rating : a.avg_rating - b.avg_rating)
      } else if (sortBy === 'likes') {
        sorted.sort((a, b) => sortOrder === 'desc' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes)
      } else if (sortBy === 'date') {
        sorted.sort((a, b) => {
          const tA = new Date(a.updated_at || a.created_at).getTime()
          const tB = new Date(b.updated_at || b.created_at).getTime()
          return sortOrder === 'desc' ? tB - tA : tA - tB
        })
      }
      return sorted
    }

    getListItems(list.id).then(d => {
      setItems(applySort(d))
      setLoadingItems(false)
    })
    
    if (user) {
      const supabase = createClient()
      supabase.from('votes')
        .select('vote_type')
        .eq('user_id', user.id)
        .eq('target_type', 'list')
        .eq('target_id', list.id)
        .maybeSingle()
        .then(({ data }) => setListVote(data?.vote_type || null))

      supabase.from('saves')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'list')
        .eq('target_id', list.id)
        .maybeSingle()
        .then(({ data }) => setListSaved(!!data))
        
      supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', list.user_id).maybeSingle()
        .then(({ data }) => setIsFollowing(!!data))
        
      supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', list.user_id).maybeSingle()
        .then(({ data }) => setIsBlocked(!!data))
    }

    const supabase = createClient()
    supabase.from('saves')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'list')
      .eq('target_id', list.id)
      .then(({ count }) => setListSavesCount(count || 0))

    supabase.from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'list')
      .eq('target_id', list.id)
      .then(({ count }) => setListCommentCount(count || 0))

  }, [list.id, list.user_id, user, sortBy, sortOrder])

  const refreshItems = async () => {
    const d = await getListItems(list.id)
    let sorted = [...d]
    if (sortBy === 'score') {
      sorted.sort((a, b) => sortOrder === 'desc' ? b.avg_rating - a.avg_rating : a.avg_rating - b.avg_rating)
    } else if (sortBy === 'likes') {
      sorted.sort((a, b) => sortOrder === 'desc' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes)
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const tA = new Date(a.updated_at || a.created_at).getTime()
        const tB = new Date(b.updated_at || b.created_at).getTime()
        return sortOrder === 'desc' ? tB - tA : tA - tB
      })
    }
    setItems(sorted)
  }

  return (
    <div className="carousel-slide relative h-full w-full flex flex-col md:flex-row bg-[#0a0a0a] overflow-hidden">
      {/* ═══ LEFT: Cover Image (22%) ═══ */}
      <div className="relative w-full md:w-[22%] h-[35vh] md:h-full shrink-0 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.8)] z-20 border-r border-white/5">
        {list.cover_image_url ? (
          <img src={list.cover_image_url} alt={list.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent opacity-60" />

        <div className="absolute top-6 left-6 z-30">
          <span className="px-4 py-2 text-[10px] font-bold tracking-[0.25em] uppercase text-white bg-accent/20 backdrop-blur-xl rounded-full border border-accent/30 shadow-2xl">
            {list.category_name || list.categories?.name || 'Categoría'}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-black/70 backdrop-blur-lg border-t border-white/10">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-accent text-xs font-black tracking-[0.2em] uppercase">
                {list.category_name || list.categories?.name || 'Categoría'}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl uppercase tracking-tighter">{list.title}</h2>
              <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium">
                <Eye size={12} /> <span>12.4k vistas</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{fmtDate(list.created_at)}</span>
              </div>
            </div>
            
            {list.description && (
              <p className="text-white/70 text-sm leading-relaxed line-clamp-3 font-serif italic border-l-2 border-accent/30 pl-4 py-1">
                "{list.description}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-4">
              <button onClick={() => handleListVote('up')} className={`flex flex-col items-center gap-1 transition-all ${listVote === 'up' ? 'text-green-400 scale-110' : 'text-white/50 hover:text-white'}`}>
                <ThumbsUp size={20} className={listVote === 'up' ? 'fill-current' : ''} />
                <span className="text-[10px] font-bold">{fmt(listUps)}</span>
              </button>
              <button onClick={() => handleListVote('down')} className={`flex flex-col items-center gap-1 transition-all ${listVote === 'down' ? 'text-red-400 scale-110' : 'text-white/50 hover:text-white'}`}>
                <ThumbsDown size={20} className={listVote === 'down' ? 'fill-current' : ''} />
                <span className="text-[10px] font-bold">{fmt(listDowns)}</span>
              </button>
            </div>
            <div className="w-px h-8 bg-white/10 mx-1" />
            <div className="flex flex-col items-center gap-1 text-white/50" title="Respuestas">
              <ImageIcon size={20} />
              <span className="text-[10px] font-bold">{items.length}</span>
            </div>
            <button onClick={() => setShowListComments(!showListComments)} className={`flex flex-col items-center gap-1 transition-all ${showListComments ? 'text-accent' : 'text-white/50 hover:text-white'}`} title="Comentarios">
              <MessageSquare size={20} />
              <span className="text-[10px] font-bold">{listCommentCount}</span>
            </button>
            <div className="flex-1" />
            <button onClick={handleListSave} className={`p-3 rounded-2xl transition-all ${listSaved ? 'bg-accent text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`} title="Guardar">
              <Bookmark size={20} className={listSaved ? 'fill-current' : ''} />
            </button>
            <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/lists/${list.id}`)
                alert('Enlace copiado al portapapeles')
              }}
              className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all"
              title="Compartir"
            >
              <Share2 size={20} />
            </button>
            <button onClick={() => setReportOpen(true)} className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all" title="Reportar">
              <AlertTriangle size={20} />
            </button>
          </div>
        </div>

        {showListComments && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col p-6 pt-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-serif font-bold text-xl flex items-center gap-2">
                <MessageSquare size={20} /> Comentarios de la lista
              </h3>
              <button onClick={() => setShowListComments(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <InlineComments targetId={list.id} targetType="list" onCountChange={setListCommentCount} listId={list.id} onExpandImage={setLightboxImage} />
            </div>
          </div>
        )}

        {reportOpen && <ReportModal targetId={list.id} targetType="list" onClose={() => setReportOpen(false)} />}
      </div>

      {/* ═══ CENTER: Items & Author Header (Auto-width) ═══ */}
      <div className="flex-1 h-full overflow-y-auto bg-[#130B07] custom-scrollbar relative z-10 border-r border-white/5">
        <div className={`max-w-5xl mx-auto min-h-full pb-32 ${!list.is_collaborative ? 'px-4 md:px-10' : ''}`}>
        {/* ═══ HEADER: Author Section ═══ */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-6 md:p-10">
          <div className="flex items-center gap-6 max-w-4xl mx-auto">
            <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent/30 shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center text-3xl text-accent font-serif font-black">
                    {username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#2B170C] rounded-full" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white leading-none">@{username}</h3>
                  <p className="text-sm text-accent/60 font-serif mt-0.5">{displayName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleFollow(list.user_id, username, user, setIsFollowing)} 
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white' : 'bg-accent text-black hover:scale-105 active:scale-95'}`}>
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </button>
                  <button onClick={() => handleBlock(list.user_id, username, user, setIsBlocked)} 
                    className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Ban size={18} />
                  </button>
                </div>
              </div>
              {bio && <p className="text-white/60 text-sm font-serif line-clamp-2 italic leading-relaxed">"{bio}"</p>}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-10 py-8 md:py-12 space-y-12 md:space-y-16 max-w-5xl mx-auto pb-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase opacity-80">
                {list.categories?.name || 'LISTA'}
              </span>
              <h2 className="text-4xl font-serif font-black text-white uppercase tracking-tighter">Respuestas de la comunidad</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase">Ordenar por:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-xs text-white outline-none font-bold">
                  <option value="score" className="bg-[#2B170C]">Puntaje</option>
                  <option value="likes" className="bg-[#2B170C]">Me gusta</option>
                  <option value="date" className="bg-[#2B170C]">Fecha</option>
                </select>
                <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                  {sortOrder === 'desc' ? <ArrowDownNarrowWide size={14} /> : <ArrowUpNarrowWide size={14} />}
                </button>
              </div>
            </div>
          </div>

          {loadingItems ? (
            <div className="py-10 flex justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center"><p className="text-sm text-white/20">Aún no hay respuestas en esta lista.</p></div>
          ) : (
            items.map(item => <ItemCard key={item.id} item={item} onRefresh={refreshItems} listId={list.id} onExpandImage={setLightboxImage} />)
          )}

          {/* Mobile Add Item Section */}
          <div className="md:hidden mt-12 p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Tu contribución</h3>
            {canAdd && user ? (
              <AddItemForm listId={list.id} onAdded={refreshItems} />
            ) : (
              <p className="text-xs text-white/40">No tienes permisos para añadir ítems.</p>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* ═══ RIGHT: Add Response Panel (25%) ═══ */}
      {list.is_collaborative && (
        <div className="hidden md:block w-[30%] h-full bg-black/60 backdrop-blur-2xl overflow-y-auto custom-scrollbar p-10 border-l border-white/5">
          <div className="space-y-10">
            <div className="p-8 bg-gradient-to-br from-accent/30 to-transparent rounded-[3rem] border border-accent/30 shadow-2xl">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-4">
                <Send size={24} className="text-accent" /> Tu contribución
              </h3>
              <p className="text-xs text-white/60 uppercase font-black tracking-widest mb-8 leading-relaxed">Únete a la conversación y agrega tu propia recomendación a esta lista colaborativa</p>
              {canAdd && user ? (
                <AddItemForm listId={list.id} onAdded={refreshItems} />
              ) : (
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-center">
                  <p className="text-sm font-bold text-white/40">No tienes permisos para añadir ítems a esta lista.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"><X size={32} /></button>
          <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {lightboxImage.endsWith('.mp4') || lightboxImage.includes('video') ? (
              <video src={lightboxImage} controls autoPlay className="w-full h-full object-contain rounded-2xl shadow-2xl" />
            ) : (
              <img src={lightboxImage} alt="" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, onRefresh, listId, onExpandImage }: { item: any; onRefresh: () => void; listId: string; onExpandImage: (url: string) => void }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [userRate, setUserRate] = useState(0)
  const [vote, setVote] = useState<'up'|'down'|null>(null)
  const [ups, setUps] = useState(item.upvotes || 0)
  const [downs, setDowns] = useState(item.downvotes || 0)
  const [saved, setSaved] = useState(false)
  const [savesCount, setSavesCount] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editDesc, setEditDesc] = useState(item.description || '')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const fetchState = async () => {
      const supabase = createClient()
      if (user) {
        const { data: vData } = await supabase.from('votes').select('vote_type').eq('user_id', user.id).eq('target_type', 'list_item').eq('target_id', item.id).maybeSingle()
        if (vData) setVote(vData.vote_type)
        const { data: sData } = await supabase.from('saves').select('id').eq('user_id', user.id).eq('target_type', 'list_item').eq('target_id', item.id).maybeSingle()
        setSaved(!!sData)
        const { data: fData } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', item.user_id).maybeSingle()
        setIsFollowing(!!fData)
        const { data: bData } = await supabase.from('blocks').select('id').eq('blocker_id', user.id).eq('blocked_id', item.user_id).maybeSingle()
        setIsBlocked(!!bData)
      }
      const { count: sCount } = await supabase.from('saves').select('*', { count: 'exact', head: true }).eq('target_type', 'list_item').eq('target_id', item.id)
      setSavesCount(sCount || 0)
    }
    fetchState()
  }, [item.id, user, item.user_id])

  const rate = async (s: number) => { 
    setUserRate(s)
    const fd = new FormData()
    fd.append('targetId', item.id)
    fd.append('targetType', 'list_item')
    fd.append('rating', s.toString())
    fd.append('content', '')
    await submitReview(fd)
    onRefresh() 
  }

  const handleVote = async (type: 'up'|'down') => {
    const prev = vote; setVote(vote === type ? null : type)
    if (type === 'up') { if (prev === 'up') setUps((u: number) => u-1); else { setUps((u: number) => u+1); if (prev === 'down') setDowns((d: number) => d-1) } }
    else { if (prev === 'down') setDowns((d: number) => d-1); else { setDowns((d: number) => d+1); if (prev === 'up') setUps((u: number) => u-1) } }
    await toggleVote('list_item', item.id, type)
  }

  const handleSave = async () => { 
    const prev = saved
    setSaved(!saved)
    setSavesCount(s => !prev ? s + 1 : s - 1)
    await toggleSave('list_item', item.id) 
  }

  const handleDelete = async () => { if (confirm('¿Eliminar este ítem?')) { await deleteListItem(item.id); onRefresh() } }
  const handleUpdate = async () => { await updateListItem(item.id, { title: editTitle, description: editDesc }); setIsEditing(false); onRefresh() }

  const canManage = user?.id === item.user_id || user?.role === 'admin' || user?.role === 'mod'
  const hasMedia = item.image_url || item.video_url
  const isItemEdited = item.updated_at && item.updated_at !== item.created_at
  const p = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles

  return (
    <div className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 relative hover:bg-white/[0.08] hover:border-white/30 shadow-2xl mb-12">
      <div className="flex flex-col">
        {/* 1. Header: Creator Info */}
        <div className="flex items-center gap-3 p-4 md:p-6 border-b border-white/5 bg-black/20">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/10 shadow-lg">
            {p?.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-white/40 font-bold">{(p?.username || 'u')[0].toUpperCase()}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest leading-none">Creado por</p>
              <span className="text-[10px] text-white/30 font-serif">{fmtDate(item.created_at)}</span>
              {isItemEdited && <span className="text-[9px] text-accent/40 italic">· Editado</span>}
            </div>
            <p className="text-sm font-black text-white truncate">@{p?.username || 'user'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => handleFollow(item.user_id, p?.username || 'user', user, setIsFollowing)} className={`p-2 rounded-xl transition-all ${isFollowing ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'bg-white/5 text-white/40 hover:text-accent'}`} title={isFollowing ? 'Siguiendo' : 'Seguir'}><UserPlus size={14} /></button>
            <button onClick={() => handleBlock(item.user_id, p?.username || 'user', user, setIsBlocked)} className={`p-2 rounded-xl transition-all ${isBlocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40 hover:text-red-500'}`} title={isBlocked ? 'Bloqueado' : 'Bloquear'}><Ban size={14} /></button>
            {canManage && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-accent transition-all"><Edit2 size={14} /></button>
                <button onClick={handleDelete} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 md:space-y-8">
          {/* 2. Title & Score */}
          <div className="space-y-6">
            <h4 className="text-4xl font-serif font-black text-white leading-none uppercase tracking-tighter">{item.title}</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 shadow-inner">
                <Star size={14} className="fill-accent text-accent" />
                <span className="text-lg font-black text-accent">{item.avg_rating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => rate(s)} className="p-1 transition-transform hover:scale-125 active:scale-90">
                    <Star size={20} className={`${userRate >= s ? 'fill-accent text-accent' : 'text-white/10 hover:text-white/30'} transition-all`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Description */}
          {isEditing ? (
            <div className="space-y-4 p-6 rounded-[2rem] bg-white/5 border border-white/10 shadow-inner">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-transparent border-b border-white/10 text-white font-bold outline-none py-2" placeholder="Título..." />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-transparent text-sm text-white/70 outline-none resize-none" rows={4} placeholder="Descripción..." />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white">Cancelar</button>
                <button onClick={handleUpdate} className="px-8 py-2 rounded-xl bg-accent text-black text-xs font-bold shadow-lg shadow-accent/20">Guardar Cambios</button>
              </div>
            </div>
          ) : (
            <p className="text-white/90 text-lg leading-relaxed font-serif whitespace-pre-wrap">{item.description}</p>
          )}

          {/* 4. Media (Full Width Scaling) */}
          {hasMedia && (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-[2.5rem] overflow-hidden bg-black shadow-2xl cursor-zoom-in group/media relative border border-white/5"
                 onClick={() => onExpandImage(item.video_url || item.image_url)}>
              {item.video_url
                ? <video src={item.video_url} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" />
                : <img src={item.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" />}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20">
                  <Search size={32} className="text-white animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* 5. Action Buttons Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-6">
              <button onClick={() => handleVote('up')} className={`flex items-center gap-2 group/v transition-colors ${vote === 'up' ? 'text-green-400' : 'text-white/40 hover:text-white'}`}>
                <div className={`p-2.5 rounded-xl transition-all ${vote === 'up' ? 'bg-green-400/20' : 'bg-white/5 group-hover/v:bg-white/10'}`}>
                  <ThumbsUp size={18} className={vote === 'up' ? 'fill-current' : ''} />
                </div>
                <span className="text-sm font-black">{ups}</span>
              </button>

              <button onClick={() => handleVote('down')} className={`flex items-center gap-2 group/v transition-colors ${vote === 'down' ? 'text-red-400' : 'text-white/40 hover:text-white'}`}>
                <div className={`p-2.5 rounded-xl transition-all ${vote === 'down' ? 'bg-red-400/20' : 'bg-white/5 group-hover/v:bg-white/10'}`}>
                  <ThumbsDown size={18} className={vote === 'down' ? 'fill-current' : ''} />
                </div>
                <span className="text-sm font-black">{downs}</span>
              </button>

              <button onClick={handleSave} className={`flex items-center gap-2 group/v transition-colors ${saved ? 'text-accent' : 'text-white/40 hover:text-white'}`}>
                <div className={`p-2.5 rounded-xl transition-all ${saved ? 'bg-accent/20' : 'bg-white/5 group-hover/v:bg-white/10'}`}>
                  <Bookmark size={18} className={saved ? 'fill-current' : ''} />
                </div>
                <span className="text-sm font-black">{savesCount}</span>
              </button>

              <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 group/v transition-colors ${showComments ? 'text-accent' : 'text-white/40 hover:text-white'}`}>
                <div className={`p-2.5 rounded-xl transition-all ${showComments ? 'bg-accent/10' : 'bg-white/5 group-hover/v:bg-white/10'}`}>
                  <MessageSquare size={18} />
                </div>
                <span className="text-sm font-black">{commentCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => { if (navigator.share) navigator.share({ title: item.title, url: window.location.href }) }} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><Share2 size={18} /></button>
              <button onClick={() => setReportOpen(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"><AlertTriangle size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-white/10 bg-black/20">
          <InlineComments targetId={item.id} targetType="list_item" onCountChange={setCommentCount} listId={listId} onExpandImage={onExpandImage} />
        </div>
      )}

      {reportOpen && <ReportModal targetId={item.id} targetType="list_item" onClose={() => setReportOpen(false)} />}
    </div>
  )
}

/* ═══════════════════════════════════════
   InlineComments
   ═══════════════════════════════════════ */
function InlineComments({ targetId, targetType, onCountChange, listId, onExpandImage }: { targetId: string; targetType: string; onCountChange: (n: number) => void; listId: string; onExpandImage: (url: string) => void }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [isVideo, setIsVideo] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const { data: sess } = await supabase.auth.getSession()
    const uid = sess?.session?.user?.id
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, parent_comment_id, depth, image_url, video_url, profiles:user_id(username, avatar_url), votes(vote_type, user_id)')
      .eq('target_type', targetType).eq('target_id', targetId)
      .order('created_at', { ascending: true })
    if (!data) { setLoading(false); return }
    const map = new Map<string, any>(); const roots: any[] = []
    data.forEach((r: any) => {
      let up = 0, down = 0, uv: 'up'|'down'|null = null
      r.votes?.forEach((v: any) => { if (v.vote_type === 'up') up++; else down++; if (uid && v.user_id === uid) uv = v.vote_type })
      
      const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      const c = { 
        ...r, 
        username: p?.username || 'user', 
        avatar_url: p?.avatar_url, 
        upvotes: up, 
        downvotes: down, 
        userVote: uv, 
        replies: [] 
      }
      map.set(c.id, c)
    })

    data.forEach((r: any) => {
      const c = map.get(r.id)
      if (r.parent_comment_id && map.has(r.parent_comment_id)) {
        map.get(r.parent_comment_id).replies.push(c)
      } else {
        roots.push(c)
      }
    })
    setComments(roots)
    onCountChange(data.length)
    setLoading(false)
  }

  useEffect(() => { load() }, [targetId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) return
    setSubmitting(true)
    const fd = new FormData()
    if (file) fd.append('media', file)
    await addComment(targetType, targetId, text, replyTo || undefined, fd)
    setText(''); setReplyTo(null); setFile(null); setPreview(null); setSubmitting(false)
    await load()
  }

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setFile(f); setIsVideo(f.type.startsWith('video/'))
    const r = new FileReader(); r.onloadend = () => setPreview(r.result as string); r.readAsDataURL(f)
  }

  if (loading) return <div className="p-4 flex justify-center"><Loader2 size={14} className="animate-spin text-white/20" /></div>

  return (
    <div className="p-3 space-y-2">
      {comments.length === 0 && <p className="text-[11px] text-white/30 text-center py-2 font-serif uppercase tracking-widest">No hay comentarios.</p>}
      {comments.map(c => <CommentBubble key={c.id} c={c} depth={0} onReply={setReplyTo} listId={listId} onRefresh={load} onExpandImage={onExpandImage} />)}

      {user && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          {preview && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20">
              {isVideo ? <video src={preview} className="w-full h-full object-cover" /> : <img src={preview} alt="" className="w-full h-full object-cover" />}
              <button onClick={() => {setFile(null); setPreview(null)}} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={10} /></button>
            </div>
          )}
          <form onSubmit={submit} className="flex items-center gap-2">
            {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-[10px] text-accent shrink-0">✕</button>}
            <input value={text} onChange={e => setText(e.target.value)} disabled={submitting}
              placeholder={replyTo ? 'Responder...' : 'Comentar...'}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 outline-none focus:border-accent/50" />
            
            <label className="p-1.5 rounded-full bg-white/5 text-white/40 hover:text-white cursor-pointer">
              <ImageIcon size={14} />
              <input type="file" className="hidden" accept="image/*,video/*" onChange={pickFile} />
            </label>

            <button type="submit" disabled={(!text.trim() && !file) || submitting}
              className="p-1.5 rounded-full bg-accent text-white disabled:opacity-30">
              {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

/* ── Comment bubble ── */
function CommentBubble({ c, depth, onReply, listId, onRefresh, onExpandImage }: { c: any; depth: number; onReply: (id: string) => void; listId: string; onRefresh: () => void; onExpandImage: (url: string) => void }) {
  const { user } = useAuth()
  const [vote, setVote] = useState<'up'|'down'|null>(c.userVote)
  const [ups, setUps] = useState(c.upvotes)
  const [downs, setDowns] = useState(c.downvotes)
  const [reportOpen, setReportOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(c.content || '')
  const [showReplies, setShowReplies] = useState(false)

  const doVote = async (t: 'up'|'down') => {
    const prev = vote; setVote(vote === t ? null : t)
    if (t === 'up') { if (prev === 'up') setUps((u: number) => u-1); else { setUps((u: number) => u+1); if (prev === 'down') setDowns((d: number) => d-1) } }
    else { if (prev === 'down') setDowns((d: number) => d-1); else { setDowns((d: number) => d+1); if (prev === 'up') setUps((u: number) => u-1) } }
    const res = await toggleVote('comment', c.id, t); if (res?.error) setVote(prev)
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres borrar este comentario?')) return
    const res = await deleteComment(c.id)
    if (!res.error) onRefresh()
    else alert(res.error)
  }

  const handleUpdate = async () => {
    if (!editText.trim()) return
    const res = await updateComment(c.id, editText)
    if (!res.error) {
      setIsEditing(false)
      onRefresh()
    } else alert(res.error)
  }

  const isOwner = user?.id === c.user_id
  const canManage = isOwner || user?.role === 'admin' || user?.role === 'mod'
  const isEdited = c.updated_at && c.updated_at !== c.created_at
  const hasMedia = c.image_url || c.video_url

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l border-white/10' : ''} group/comment`}>
      <div className="rounded-2xl px-6 py-5 bg-white/5 border border-white/5 mb-3 transition-all hover:bg-white/[0.08] hover:border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-black text-accent border border-accent/20">
              {c.username[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <a href={`/profile/${c.username}`} className="text-sm font-black text-white hover:text-accent transition-colors">@{c.username}</a>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">{fmtDate(c.created_at)}</span>
                {isEdited && <span className="text-[9px] text-accent/50 italic font-black uppercase tracking-widest">· Editado</span>}
              </div>
            </div>
          </div>
          {canManage && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
              <button onClick={() => setIsEditing(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-accent transition-all"><Edit2 size={12} /></button>
              <button onClick={handleDelete} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4 p-4 rounded-xl bg-black/40 border border-white/10">
            <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none resize-none" rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-lg text-xs font-black text-white/40 hover:text-white transition-all uppercase">Cancelar</button>
              <button onClick={handleUpdate} className="px-6 py-1.5 rounded-lg bg-accent text-black text-xs font-black uppercase shadow-lg shadow-accent/20 transition-all">Guardar</button>
            </div>
          </div>
        ) : (
          <p className="text-base text-white/90 leading-relaxed font-serif">{c.content}</p>
        )}

        {hasMedia && (
          <div className="mt-4 w-full max-w-md aspect-video rounded-xl overflow-hidden border border-white/10 cursor-zoom-in group/media relative"
               onClick={() => onExpandImage(c.video_url || c.image_url)}>
            {c.video_url ? <video src={c.video_url} className="w-full h-full object-cover" /> : <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
              <Search size={24} className="text-white" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => doVote('up')} className={`flex items-center gap-1.5 transition-colors ${vote === 'up' ? 'text-green-400' : 'text-white/40 hover:text-white'}`}>
              <ThumbsUp size={14} className={vote === 'up' ? 'fill-current' : ''} />
              <span className="text-[11px] font-black">{ups}</span>
            </button>
            <button onClick={() => doVote('down')} className={`flex items-center gap-1.5 transition-colors ${vote === 'down' ? 'text-red-400' : 'text-white/40 hover:text-white'}`}>
              <ThumbsDown size={14} className={vote === 'down' ? 'fill-current' : ''} />
              <span className="text-[11px] font-black">{downs}</span>
            </button>
          </div>

          <button onClick={() => onReply(c.id)} className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-accent flex items-center gap-2 transition-all">
            <MessageSquare size={14} /> Responder
          </button>
          
          {c.replies?.length > 0 && (
            <button onClick={() => setShowReplies(!showReplies)} className="text-[11px] font-black uppercase tracking-[0.15em] text-accent/80 hover:text-accent transition-all">
              {showReplies ? 'Contraer' : `Ver ${c.replies.length} respuestas`}
            </button>
          )}

          <button onClick={() => setReportOpen(true)} className="ml-auto p-1.5 rounded-lg text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <AlertTriangle size={14} />
          </button>
        </div>
      </div>
      {showReplies && c.replies?.length > 0 && (
        <div className="mt-1.5 space-y-1.5">{c.replies.map((r: any) => <CommentBubble key={r.id} c={r} depth={depth+1} onReply={onReply} listId={listId} onRefresh={onRefresh} onExpandImage={onExpandImage} />)}</div>
      )}

      {reportOpen && <ReportModal targetId={c.id} targetType="comment" onClose={() => setReportOpen(false)} />}
    </div>
  )
}

/* ═══════════════════════════════════════
   AddItemForm — add response to list
   ═══════════════════════════════════════ */
function AddItemForm({ listId, onAdded }: { listId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = { current: null as HTMLInputElement | null }

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setFile(f); setIsVideo(f.type.startsWith('video/'))
    const r = new FileReader(); r.onloadend = () => setPreview(r.result as string); r.readAsDataURL(f)
  }
  const clearFile = () => { setFile(null); setPreview(null); setIsVideo(false) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    if (!title.trim() && !file) { setError('Agrega un título o un archivo multimedia.'); return }
    if (!title.trim() && desc.trim() && !file) { setError('La descripción sola no es suficiente.'); return }
    setBusy(true); setSuccess(false)
    try {
      const fd = new FormData(); if (file) fd.append('media', file)
      const res = await createListItem({ listId, title: title.trim() || '(Sin título)', description: desc.trim() }, fd)
      if (res.error) { setError(res.error) }
      else { setSuccess(true); setTitle(''); setDesc(''); clearFile(); onAdded(); setTimeout(() => setSuccess(false), 3000) }
    } catch (err: any) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="rounded-[2.5rem] bg-accent text-white p-8 shadow-2xl shadow-accent/20 space-y-6 font-serif relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-2">
          <h4 className="text-3xl font-black uppercase tracking-tighter">Participar</h4>
          <p className="text-xs font-black text-white/70 uppercase tracking-[0.2em]">Añade tu respuesta a esta lista</p>
        </div>
      </div>

      {error && <p className="text-white text-[11px] bg-red-500/20 border border-white/20 p-4 rounded-2xl backdrop-blur-md animate-shake">{error}</p>}
      {success && <p className="text-white text-[11px] bg-green-500/20 border border-white/20 p-4 rounded-2xl backdrop-blur-md">¡Añadido con éxito!</p>}

      <form onSubmit={submit} className="space-y-4 relative z-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 ml-2">Título de tu respuesta</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Cuál es tu elección?"
            className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-[1.5rem] text-lg text-white placeholder:text-white/30 outline-none focus:bg-white/20 focus:border-white/40 transition-all font-bold" disabled={busy} />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 ml-2">Descripción o argumento</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Cuéntanos por qué esto merece estar aquí..." rows={5}
            className="w-full px-8 py-5 bg-white/10 border border-white/20 rounded-[1.5rem] text-base text-white placeholder:text-white/30 outline-none focus:bg-white/20 focus:border-white/40 transition-all resize-none leading-relaxed" disabled={busy} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
          <label className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-4 bg-white/10 border border-white/20 border-dashed rounded-2xl text-xs font-bold cursor-pointer hover:bg-white/20 transition-all group/file">
            {preview ? (
              <div className="flex items-center gap-3">
                {isVideo ? <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><ImageIcon size={14} /></div> : <img src={preview} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                <span className="truncate max-w-[100px]">Archivo cargado</span>
                <button type="button" onClick={(e) => { e.preventDefault(); clearFile(); }} className="text-white/50 hover:text-white"><X size={14} /></button>
              </div>
            ) : (
              <>
                <ImageIcon size={16} className="group-hover/file:scale-110 transition-transform" />
                <span>Subir Foto o Video</span>
              </>
            )}
            <input type="file" accept="image/*,video/*" onChange={pickFile} className="hidden" />
          </label>

          <button type="submit" disabled={busy}
            className="w-full md:w-auto px-12 py-5 bg-white text-accent rounded-full font-black uppercase tracking-widest text-sm hover:bg-opacity-95 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/30 flex items-center justify-center gap-3">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            <span>Publicar respuesta</span>
          </button>
        </div>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════
   Report Modal
   ═══════════════════════════════════════ */
function ReportModal({ targetId, targetType, onClose }: { targetId: string, targetType: string, onClose: () => void }) {
  const [reason, setReason] = useState('spam')
  const [desc, setDesc] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(null)
    const fd = new FormData()
    fd.append('targetType', targetType)
    fd.append('targetId', targetId)
    fd.append('reason', reason)
    fd.append('description', desc)
    const res = await submitReport(fd)
    if (res.error) {
      setError(res.error)
      setBusy(false)
    } else {
      alert('Reporte enviado gracias por tu colaboración.')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-border-dark/10 flex items-center justify-between">
          <h3 className="font-bold text-text-dark flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Reportar</h3>
          <button onClick={onClose} className="text-text-dark/30 hover:text-text-dark"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-dark/70 uppercase tracking-wider">Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-page border border-border-dark/10 text-sm focus:border-accent/50 outline-none">
              <option value="spam">Spam / Publicidad no deseada</option>
              <option value="harassment">Acoso / Lenguaje de odio</option>
              <option value="inappropriate">Contenido inapropiado / explícito</option>
              <option value="scam">Estafa / Fraude</option>
              <option value="other">Otro motivo</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-dark/70 uppercase tracking-wider">Detalles (Opcional)</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Brinda más información..." className="w-full px-3 py-2 rounded-lg bg-bg-page border border-border-dark/10 text-sm focus:border-accent/50 outline-none resize-none" />
          </div>
          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-dark/60 hover:text-text-dark transition-colors">Cancelar</button>
            <button type="submit" disabled={busy} className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors flex items-center gap-2">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />} Enviar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
