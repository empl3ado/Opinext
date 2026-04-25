'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle,
  Star, Eye, Bookmark, Heart, Share2, UserPlus, Send,
  ChevronDown, ChevronUp, Loader2, Image as ImageIcon, X, Flag, Ban
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getListItems, createListItem } from '@/app/actions/lists'
import { toggleVote, toggleSave, addComment, submitReview, submitReport } from '@/app/actions/social'
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
  const [reportOpen, setReportOpen] = useState(false)

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
    getListItems(list.id).then(d => { setItems(d); setLoadingItems(false) })
  }, [list.id])

  const refreshItems = async () => {
    const fresh = await getListItems(list.id)
    setItems(fresh)
  }

  return (
    <div className="carousel-slide relative h-full flex flex-col md:flex-row pt-16 bg-bg-secondary">
      {/* ═══ LEFT: Cover Image ═══ */}
      <div className="relative w-full md:w-1/2 h-[45vh] md:h-full shrink-0">
        {list.cover_image_url ? (
          <img src={list.cover_image_url} alt={list.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* Category badge */}
        {list.category_name && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/90 bg-white/15 backdrop-blur-md rounded-full border border-white/10">
              {list.category_name}
            </span>
          </div>
        )}

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight">{list.title}</h2>
              <span className="text-white/40 text-xs shrink-0">{fmtDate(list.created_at)}</span>
            </div>
            {list.description && (
              <p className="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-lg">{list.description}</p>
            )}
          </div>

          {/* Stats row / Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10">
            <button onClick={() => handleListVote('up')} className={`flex items-center gap-1 text-sm font-bold ${listVote === 'up' ? 'text-green-400' : 'text-white/70 hover:text-white'}`}>
              <ThumbsUp size={16} className={listVote === 'up' ? 'fill-current' : ''} /> {fmt(listUps)}
            </button>
            <button onClick={() => handleListVote('down')} className={`flex items-center gap-1 text-sm font-bold ${listVote === 'down' ? 'text-red-400' : 'text-white/70 hover:text-white'}`}>
              <ThumbsDown size={16} className={listVote === 'down' ? 'fill-current' : ''} /> {fmt(listDowns)}
            </button>
            
            <div className="flex items-center gap-1 text-sm font-bold text-white/70">
              <MessageSquare size={16} /> {items.length}
            </div>

            <div className="flex-1" />
            
            <button onClick={handleListSave} className={`p-1.5 rounded-md transition-colors ${listSaved ? 'text-accent' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title="Guardar lista">
              <Bookmark size={16} className={listSaved ? 'fill-current' : ''} />
            </button>
            <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/lists/${list.id}`)
                alert('Enlace copiado al portapapeles')
              }}
              className="p-1.5 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors" title="Compartir lista"
            >
              <Share2 size={16} />
            </button>
            <button onClick={() => setReportOpen(true)} className="p-1.5 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors" title="Reportar lista">
              <AlertTriangle size={16} />
            </button>
          </div>
        </div>

        {reportOpen && <ReportModal targetId={list.id} targetType="list" onClose={() => setReportOpen(false)} />}
      </div>

      {/* ═══ RIGHT: Content Panel ═══ */}
      <div className="flex-1 h-[55vh] md:h-full overflow-y-auto bg-stone-100">
        {/* Author section */}
        <div className="p-5 border border-black/80 m-2 rounded-lg bg-[#ffffcc] z-10 relative">
          <div className="flex flex-col items-center text-center">
            <a href={`/profile/${username}`} className="mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-accent/20 border border-black/20 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-xl font-bold text-accent">{username[0]?.toUpperCase()}</span>}
              </div>
            </a>
            
            <a href={`/profile/${username}`} className="font-serif font-bold text-lg text-text-dark hover:underline">@{username}</a>
            <p className="text-xs font-bold text-text-dark/50 mt-1">1.2k Seguidores</p>
            
            {bio && <p className="text-sm font-serif text-text-dark/70 mt-3 leading-relaxed">{bio}</p>}
            
            {!isOwner && user && (
              <div className="flex items-center gap-3 mt-4">
                <button className="flex items-center gap-1.5 text-xs font-bold uppercase text-white bg-accent px-4 py-1.5 rounded hover:bg-accent-hover transition-colors border border-black/80">
                  <UserPlus size={14} /> Seguir
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold uppercase text-white bg-red-500 px-4 py-1.5 rounded hover:bg-red-600 transition-colors border border-black/80">
                  <Ban size={14} /> Bloquear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Items header */}
        <div className="mx-2 px-5 py-2.5 bg-[#7a81ff] border border-black/80 rounded-lg">
          <h3 className="text-sm font-bold uppercase text-white text-center font-serif">
            Items de la lista
          </h3>
        </div>

        {/* Items list */}
        <div className="p-4 space-y-3">
          {loadingItems ? (
            <div className="py-10 flex justify-center"><Loader2 size={20} className="animate-spin text-text-dark/30" /></div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-text-dark/30">Aún no hay respuestas en esta lista.</p>
            </div>
          ) : (
            items.map(item => (
              <ItemCard key={item.id} item={item} onRefresh={refreshItems} listId={list.id} />
            ))
          )}

          {/* Add item button/form */}
          {canAdd && user && (
            <AddItemForm listId={list.id} onAdded={refreshItems} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Stat pill ── */
function StatItem({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center gap-1.5 text-white/50">
      {icon}
      <span className="text-xs font-semibold text-white/70">{fmt(value)}</span>
    </div>
  )
}

/* ═══════════════════════════════════════
   ItemCard — single list item
   ═══════════════════════════════════════ */
function ItemCard({ item, onRefresh, listId }: { item: any; onRefresh: () => void; listId: string }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  const [rating, setRating] = useState(item.rating_score || 0)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [vote, setVote] = useState<'up'|'down'|null>(null)
  const [ups, setUps] = useState(item.upvotes || 0)
  const [downs, setDowns] = useState(item.downvotes || 0)
  const [saved, setSaved] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const author = item.profiles?.username || 'usuario'
  const authorAvatar = item.profiles?.avatar_url
  const hasMedia = item.image_url || item.video_url

  // Fetch comment count
  useEffect(() => {
    const fetchCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'list_item')
        .eq('target_id', item.id)
      setCommentCount(count || 0)
    }
    fetchCount()
  }, [item.id])

  const handleVote = async (type: 'up'|'down') => {
    if (!user) return
    const prev = vote
    setVote(vote === type ? null : type)
    if (type === 'up') {
      if (prev === 'up') setUps((u: number) => u-1)
      else { setUps((u: number) => u+1); if (prev === 'down') setDowns((d: number) => d-1) }
    } else {
      if (prev === 'down') setDowns((d: number) => d-1)
      else { setDowns((d: number) => d+1); if (prev === 'up') setUps((u: number) => u-1) }
    }
    const res = await toggleVote('list_item', item.id, type)
    if (res?.error) setVote(prev)
  }

  const handleRate = async (score: number) => {
    if (!user || score === 0) return
    setRating(score)
    setRatingBusy(true)
    const fd = new FormData()
    fd.append('targetId', item.id)
    fd.append('targetType', 'list_item')
    fd.append('rating', score.toString())
    fd.append('content', '')
    await submitReview(fd)
    setRatingBusy(false)
    onRefresh()
  }

  return (
    <div className="bg-[#ffffcc] border border-black/80 rounded-lg overflow-hidden relative">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <a href={`/profile/${author}`} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20">
                {authorAvatar ? <img src={authorAvatar} alt="" className="w-full h-full object-cover" /> : <span className="text-accent text-xs font-bold w-full h-full flex items-center justify-center">{author[0]?.toUpperCase()}</span>}
              </div>
              <span className="font-serif font-bold text-base text-text-dark group-hover:underline">@{author}</span>
            </a>
            {!user || user.id !== item.user_id ? (
              <>
                <button className="text-[10px] font-bold uppercase text-accent hover:underline ml-2"><UserPlus size={12} className="inline mr-1" />Seguir</button>
                <button className="text-[10px] font-bold uppercase text-red-500 hover:underline ml-2"><Ban size={12} className="inline mr-1" />Bloquear</button>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-serif">{Number(rating || item.avg_rating || 0).toFixed(1)}</span>
            <StarRating
              rating={rating || item.avg_rating || 0}
              size={14}
              interactive={!!user}
              onRate={handleRate}
            />
            {ratingBusy && <Loader2 size={10} className="animate-spin text-text-dark/30" />}
          </div>
        </div>

        {/* Content + optional media */}
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <h4 className="font-serif text-lg font-semibold text-text-dark leading-tight">{item.title}</h4>
            {item.description && <p className="text-sm text-text-dark/70 leading-relaxed font-serif">{item.description}</p>}
          </div>
          {hasMedia && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/5 shrink-0">
              {item.video_url
                ? <video src={item.video_url} className="w-full h-full object-cover" />
                : <Image src={item.image_url} alt="" width={64} height={64} className="w-full h-full object-cover" />}
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/10">
          <button onClick={() => handleVote('up')} className={`flex items-center gap-1 text-sm font-bold ${vote === 'up' ? 'text-green-600' : 'text-text-dark/70 hover:text-text-dark'}`}>
            <ThumbsUp size={18} className={vote === 'up' ? 'fill-current' : ''} /> {fmt(ups)}
          </button>
          <button onClick={() => handleVote('down')} className={`flex items-center gap-1 text-sm font-bold ${vote === 'down' ? 'text-red-500' : 'text-text-dark/70 hover:text-text-dark'}`}>
            <ThumbsDown size={18} className={vote === 'down' ? 'fill-current' : ''} /> {fmt(downs)}
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-sm font-bold text-text-dark/70 hover:text-text-dark ml-2">
            <MessageSquare size={18} /> {commentCount}
          </button>

          <div className="flex-1" />
          
          <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/item/${item.id}`)
              alert('Enlace copiado al portapapeles')
            }}
            className="p-1.5 rounded-md text-text-dark/70 hover:bg-black/5 hover:text-text-dark transition-colors"
            title="Compartir"
          >
            <Share2 size={18} />
          </button>
          <button onClick={() => setReportOpen(true)} className="p-1.5 rounded-md text-text-dark/70 hover:bg-black/5 hover:text-text-dark transition-colors" title="Reportar">
            <AlertTriangle size={18} />
          </button>
        </div>
      </div>

      {/* Inline comments */}
      {showComments && (
        <div className="border-t border-black/80 bg-[#e6e67e]">
          <InlineComments targetId={item.id} onCountChange={setCommentCount} listId={listId} />
        </div>
      )}

      {reportOpen && <ReportModal targetId={item.id} targetType="list_item" onClose={() => setReportOpen(false)} />}
    </div>
  )
}

/* ═══════════════════════════════════════
   InlineComments
   ═══════════════════════════════════════ */
function InlineComments({ targetId, onCountChange, listId }: { targetId: string; onCountChange: (n: number) => void; listId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const { data: sess } = await supabase.auth.getSession()
    const uid = sess?.session?.user?.id
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, parent_comment_id, depth, profiles:user_id(username, avatar_url), votes(vote_type, user_id)')
      .eq('target_type', 'list_item').eq('target_id', targetId)
      .order('created_at', { ascending: true })
    if (!data) { setLoading(false); return }
    const map = new Map<string, any>(); const roots: any[] = []
    data.forEach((r: any) => {
      let up = 0, down = 0, uv: 'up'|'down'|null = null
      r.votes?.forEach((v: any) => { if (v.vote_type === 'up') up++; else down++; if (uid && v.user_id === uid) uv = v.vote_type })
      const c = { ...r, username: r.profiles?.username || 'user', avatar_url: r.profiles?.avatar_url, upvotes: up, downvotes: down, userVote: uv, replies: [] }
      map.set(c.id, c)
      if (r.parent_comment_id && map.has(r.parent_comment_id)) map.get(r.parent_comment_id).replies.push(c)
      else roots.push(c)
    })
    setComments(roots)
    onCountChange(data.length)
    setLoading(false)
  }

  useEffect(() => { load() }, [targetId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await addComment('list_item', targetId, text, replyTo || undefined)
    setText(''); setReplyTo(null); setSubmitting(false)
    await load()
  }

  if (loading) return <div className="p-4 flex justify-center"><Loader2 size={14} className="animate-spin text-text-dark/30" /></div>

  return (
    <div className="p-3 space-y-2">
      {comments.length === 0 && <p className="text-[11px] text-black/50 text-center py-2 font-serif">No hay comentarios.</p>}
      {comments.map(c => <CommentBubble key={c.id} c={c} depth={0} onReply={setReplyTo} listId={listId} />)}

      {user && (
        <form onSubmit={submit} className="flex items-center gap-2 pt-2 border-t border-border-dark/10">
          {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-[10px] text-accent shrink-0">✕</button>}
          <input value={text} onChange={e => setText(e.target.value)} disabled={submitting}
            placeholder={replyTo ? 'Responder...' : 'Comentar...'}
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-page border border-border-dark/10 text-xs text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50" />
          <button type="submit" disabled={!text.trim() || submitting}
            className="p-1.5 rounded-full bg-bg-primary text-white disabled:opacity-30">
            {submitting ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
          </button>
        </form>
      )}
    </div>
  )
}

/* ── Comment bubble ── */
function CommentBubble({ c, depth, onReply, listId }: { c: any; depth: number; onReply: (id: string) => void; listId: string }) {
  const [vote, setVote] = useState<'up'|'down'|null>(c.userVote)
  const [ups, setUps] = useState(c.upvotes)
  const [downs, setDowns] = useState(c.downvotes)
  const [reportOpen, setReportOpen] = useState(false)

  const doVote = async (t: 'up'|'down') => {
    const prev = vote; setVote(vote === t ? null : t)
    if (t === 'up') { if (prev === 'up') setUps((u: number) => u-1); else { setUps((u: number) => u+1); if (prev === 'down') setDowns((d: number) => d-1) } }
    else { if (prev === 'down') setDowns((d: number) => d-1); else { setDowns((d: number) => d+1); if (prev === 'up') setUps((u: number) => u-1) } }
    const res = await toggleVote('comment', c.id, t); if (res?.error) setVote(prev)
  }

  return (
    <div className={depth > 0 ? 'ml-5 pl-3 border-l-2 border-black/20' : ''}>
      <div className="rounded-lg px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <a href={`/profile/${c.username}`} className="text-sm font-bold font-serif text-text-dark hover:underline">@{c.username}</a>
          <span className="text-[10px] text-text-dark/50 font-serif">{timeAgo(c.created_at)}</span>
        </div>
        <p className="text-xs text-text-dark/80 leading-relaxed font-serif">{c.content}</p>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={() => doVote('up')} className={`flex items-center gap-0.5 text-[11px] font-bold ${vote === 'up' ? 'text-green-600' : 'text-text-dark/70 hover:text-text-dark'}`}>
            <ThumbsUp size={12} className={vote === 'up' ? 'fill-current' : ''} /> {ups}
          </button>
          <button onClick={() => doVote('down')} className={`flex items-center gap-0.5 text-[11px] font-bold ${vote === 'down' ? 'text-red-500' : 'text-text-dark/70 hover:text-text-dark'}`}>
            <ThumbsDown size={12} className={vote === 'down' ? 'fill-current' : ''} /> {downs}
          </button>
          <button onClick={() => onReply(c.id)} className="text-[11px] font-bold text-text-dark/70 hover:text-text-dark">
            <MessageSquare size={12} />
          </button>
          <button onClick={() => setReportOpen(true)} className="text-[11px] font-bold text-text-dark/70 hover:text-text-dark ml-auto">
            <AlertTriangle size={12} />
          </button>
        </div>
      </div>
      {c.replies?.length > 0 && (
        <div className="mt-1.5 space-y-1.5">{c.replies.map((r: any) => <CommentBubble key={r.id} c={r} depth={depth+1} onReply={onReply} listId={listId} />)}</div>
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

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-lg border border-black/80 bg-[#e866e8] text-black text-sm font-bold tracking-[0.15em] uppercase hover:bg-[#d858d8] transition-colors shadow-sm font-serif">
        + Agregar respuesta a la lista
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-black/80 bg-[#e866e8] p-4 shadow-sm space-y-3 font-serif">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase text-black">Añadir a la lista</h4>
        <button onClick={() => setOpen(false)} className="text-text-dark/30 hover:text-text-dark"><X size={14} /></button>
      </div>

      {error && <p className="text-red-600 text-[11px] bg-red-50 border border-red-200 p-2 rounded-lg">{error}</p>}
      {success && <p className="text-green-700 text-[11px] bg-green-50 border border-green-200 p-2 rounded-lg">¡Añadido!</p>}

      <form onSubmit={submit} className="space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título (opcional si adjuntas archivo)"
          className="w-full px-3 py-2 bg-bg-page border border-border-dark/10 rounded-lg text-xs text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50" disabled={busy} />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (opcional)" rows={2}
          className="w-full px-3 py-2 bg-bg-page border border-border-dark/10 rounded-lg text-xs text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50 resize-none" disabled={busy} />

        {preview && (
          <div className="relative inline-block group">
            {isVideo ? <video src={preview} className="h-16 rounded-lg" controls /> : <img src={preview} alt="" className="h-16 rounded-lg object-cover" />}
            <button type="button" onClick={clearFile} className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full shadow border border-border-dark/10 opacity-0 group-hover:opacity-100"><X size={10} /></button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1 px-2 py-1.5 text-[11px] text-text-dark/40 hover:text-text-dark hover:bg-black/5 rounded-md cursor-pointer transition-colors">
            <ImageIcon size={13} /> Foto/Video
            <input type="file" accept="image/*,video/*" onChange={pickFile} className="hidden" />
          </label>
          <button type="submit" disabled={busy}
            className="flex items-center gap-1.5 bg-black text-white px-4 py-1.5 rounded-full text-[11px] font-bold disabled:opacity-40 hover:bg-black/80 transition-colors">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Añadir
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
