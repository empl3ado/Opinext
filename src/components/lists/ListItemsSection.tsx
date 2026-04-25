'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  Send, Image as ImageIcon, X, Loader2, Star,
  ThumbsUp, ThumbsDown, Bookmark, Share2, Flag,
  MessageSquare, ChevronDown, ChevronUp, UserPlus
} from 'lucide-react'
import { getListItems, createListItem } from '@/app/actions/lists'
import { toggleVote, toggleSave, addComment } from '@/app/actions/social'
import { submitReview } from '@/app/actions/social'
import { useAuth } from '@/components/auth/AuthProvider'
import StarRating from '@/components/ui/StarRating'

interface ListItemsSectionProps {
  listId: string
  isCollaborative: boolean
  isOwner: boolean
}

/* ─── tiny helpers ─── */
function timeAgo(d: string) {
  const ms = Date.now() - new Date(d).getTime()
  const m = Math.floor(ms / 60000), h = Math.floor(m / 60), dy = Math.floor(h / 24)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  if (h < 24) return `${h}h`
  if (dy < 7) return `${dy}d`
  return new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function fmt(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'
  return String(n)
}

/* ─────────────────────────────────────────────────── */
export default function ListItemsSection({ listId, isCollaborative, isOwner }: ListItemsSectionProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* form state */
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAdd = isOwner || isCollaborative

  useEffect(() => {
    getListItems(listId).then(d => { setItems(d); setLoading(false) })
  }, [listId])

  /* media handlers */
  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setMediaFile(f)
    setIsVideo(f.type.startsWith('video/'))
    const r = new FileReader()
    r.onloadend = () => setMediaPreview(r.result as string)
    r.readAsDataURL(f)
  }
  const removeMedia = () => {
    setMediaFile(null); setMediaPreview(null); setIsVideo(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const hasTitle = title.trim().length > 0
    const hasMedia = !!mediaFile

    if (!hasTitle && !hasMedia) {
      setFormError('Debes completar el título o agregar una imagen/video para añadir a la lista.')
      return
    }
    if (!hasTitle && description.trim().length > 0 && !hasMedia) {
      setFormError('La descripción sola no es suficiente. Agrega un título o un archivo multimedia.')
      return
    }

    setIsSubmitting(true)
    setFormSuccess(false)
    try {
      const fd = new FormData()
      if (mediaFile) fd.append('media', mediaFile)
      const res = await createListItem({
        listId,
        title: title.trim() || '(Sin título)',
        description: description.trim()
      }, fd)
      if (res.error) { setFormError(res.error) } else {
        setFormSuccess(true)
        setTitle(''); setDescription(''); removeMedia()
        const fresh = await getListItems(listId)
        setItems(fresh)
        setTimeout(() => setFormSuccess(false), 3000)
      }
    } catch (err: any) { setFormError(err.message || 'Error inesperado') }
    finally { setIsSubmitting(false) }
  }

  if (loading) return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-text-dark/40" /></div>

  return (
    <div className="space-y-6">
      {/* ── Add form ── */}
      {canAdd && user && (
        <div className="rounded-2xl border border-border-dark/10 bg-white shadow-sm overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
              <Loader2 size={22} className="text-bg-primary animate-spin" />
            </div>
          )}

          <div className="px-5 pt-5 pb-2">
            <h3 className="text-sm font-bold tracking-wider uppercase text-text-dark/50 mb-3">Añadir a la lista</h3>

            {formError && (
              <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
                <Flag size={14} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="text-green-700 text-xs bg-green-50 border border-green-200 p-3 rounded-xl mb-3 font-medium">
                ¡Añadido con éxito!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Título (o deja vacío si adjuntas archivo)"
                className="w-full px-4 py-3 bg-[#F8F7F4] border border-border-dark/10 rounded-xl text-sm text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50 transition-colors"
                disabled={isSubmitting}
              />
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={2}
                className="w-full px-4 py-3 bg-[#F8F7F4] border border-border-dark/10 rounded-xl text-sm text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50 transition-colors resize-none"
                disabled={isSubmitting}
              />

              {mediaPreview && (
                <div className="relative inline-block group">
                  {isVideo
                    ? <video src={mediaPreview} className="h-24 rounded-xl border border-border-dark/10 object-cover" controls />
                    : <img src={mediaPreview} alt="Preview" className="h-24 rounded-xl border border-border-dark/10 object-cover" />
                  }
                  <button type="button" onClick={removeMedia}
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md border border-border-dark/10 hover:bg-gray-50 text-text-dark opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 pb-2">
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleMedia} accept="image/*,video/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-text-dark/50 hover:text-text-dark hover:bg-black/5 rounded-lg transition-colors">
                    <ImageIcon size={15} /><span>Foto / Video</span>
                  </button>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#1A1612] text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide disabled:opacity-40 hover:bg-[#2A2622] transition-colors shadow-sm">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Items list ── */}
      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border-dark/10">
          <MessageSquare size={28} className="mx-auto text-text-dark/10 mb-3" />
          <p className="text-sm font-medium text-text-dark/30">Aún no hay respuestas</p>
          <p className="text-xs text-text-dark/20 mt-1">
            {canAdd ? 'Sé el primero en aportar.' : 'Esta lista aún no tiene contenido.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold tracking-wider uppercase text-text-dark/40">
            {items.length} {items.length === 1 ? 'respuesta' : 'respuestas'}
          </p>
          {items.map(item => <ListItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ListItemCard — one item inside a list
   ═══════════════════════════════════════════════════ */
function ListItemCard({ item }: { item: any }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingSubmitting, setRatingSubmitting] = useState(false)
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [ups, setUps] = useState(item.upvotes || 0)
  const [downs, setDowns] = useState(item.downvotes || 0)
  const [saved, setSaved] = useState(false)

  /* ─ vote ─ */
  const handleVote = async (type: 'up' | 'down') => {
    const prev = vote
    const newVote = vote === type ? null : type
    setVote(newVote)
    if (type === 'up') {
      if (prev === 'up') setUps((u: number) => u - 1)
      else { setUps((u: number) => u + 1); if (prev === 'down') setDowns((d: number) => d - 1) }
    } else {
      if (prev === 'down') setDowns((d: number) => d - 1)
      else { setDowns((d: number) => d + 1); if (prev === 'up') setUps((u: number) => u - 1) }
    }
    const res = await toggleVote('list_item', item.id, type)
    if (res?.error) setVote(prev)
  }

  /* ─ save ─ */
  const handleSave = async () => {
    setSaved(!saved)
    await toggleSave('list_item', item.id)
  }

  /* ─ rate ─ */
  const handleRate = async (score: number) => {
    setRating(score)
    if (score === 0) return
    setRatingSubmitting(true)
    const fd = new FormData()
    fd.append('targetId', item.id)
    fd.append('targetType', 'list_item')
    fd.append('rating', score.toString())
    fd.append('content', '')
    await submitReview(fd)
    setRatingSubmitting(false)
  }

  const username = item.profiles?.username || 'usuario'
  const avatarUrl = item.profiles?.avatar_url
  const hasMedia = item.image_url || item.video_url

  return (
    <div className="rounded-2xl border border-border-dark/10 bg-white shadow-sm overflow-hidden">
      {/* Media */}
      {hasMedia && (
        <div className="w-full aspect-video bg-black/5 overflow-hidden">
          {item.video_url
            ? <video src={item.video_url} controls className="w-full h-full object-cover" />
            : <Image src={item.image_url} alt={item.title || ''} width={800} height={450} className="w-full h-full object-cover" />
          }
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Author row */}
        <div className="flex items-center justify-between">
          <a href={`/profile/${username}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#E5E0D8] shrink-0 relative flex items-center justify-center">
              {avatarUrl
                ? <Image src={avatarUrl} alt="" fill className="object-cover" />
                : <span className="text-[11px] font-bold text-text-dark/60">{username[0]?.toUpperCase()}</span>
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-text-dark group-hover:underline">@{username}</p>
              <p className="text-[10px] text-text-dark/40">{timeAgo(item.created_at)}</p>
            </div>
          </a>
          <button className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-[#B8A080] hover:text-[#8A7060] border border-accent/30 hover:border-accent-hover/40 px-3 py-1.5 rounded-full transition-colors">
            <UserPlus size={12} />
            Seguir
          </button>
        </div>

        {/* Title & description */}
        {item.title && item.title !== '(Sin título)' && (
          <h4 className="font-serif text-lg text-text-dark leading-snug">{item.title}</h4>
        )}
        {item.description && (
          <p className="text-sm text-text-dark/70 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        )}

        {/* Star rating row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div>
              <StarRating
                rating={rating || item.avg_rating || 0}
                interactive={!!user}
                onRate={handleRate}
                size={18}
              />
            </div>
            {ratingSubmitting && <Loader2 size={12} className="animate-spin text-text-dark/30" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-dark/50">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="font-semibold text-text-dark">{Number(item.avg_rating || 0).toFixed(1)}</span>
            <span>({item.rating_count || 0})</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border-dark/10">
          <div className="flex items-center gap-1">
            {/* Like */}
            <button onClick={() => handleVote('up')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${vote === 'up' ? 'bg-green-50 text-green-600' : 'text-text-dark/40 hover:bg-black/5 hover:text-text-dark'}`}>
              <ThumbsUp size={14} className={vote === 'up' ? 'fill-current' : ''} />
              {fmt(ups)}
            </button>
            {/* Dislike */}
            <button onClick={() => handleVote('down')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${vote === 'down' ? 'bg-red-50 text-red-500' : 'text-text-dark/40 hover:bg-black/5 hover:text-text-dark'}`}>
              <ThumbsDown size={14} className={vote === 'down' ? 'fill-current' : ''} />
              {fmt(downs)}
            </button>
            {/* Comment toggle */}
            <button onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-dark/40 hover:bg-black/5 hover:text-text-dark transition-colors">
              <MessageSquare size={14} />
              {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Save */}
            <button onClick={handleSave}
              className={`p-2 rounded-lg transition-colors ${saved ? 'text-amber-500' : 'text-text-dark/30 hover:text-text-dark/60 hover:bg-black/5'}`}>
              <Bookmark size={15} className={saved ? 'fill-current' : ''} />
            </button>
            {/* Share */}
            <button className="p-2 rounded-lg text-text-dark/30 hover:text-text-dark/60 hover:bg-black/5 transition-colors">
              <Share2 size={15} />
            </button>
            {/* Report */}
            <button className="p-2 rounded-lg text-text-dark/30 hover:text-text-dark/60 hover:bg-black/5 transition-colors">
              <Flag size={15} />
            </button>
          </div>
        </div>

        {/* Inline comments */}
        {showComments && (
          <div className="pt-2">
            <InlineComments targetType="list_item" targetId={item.id} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   InlineComments — lightweight threaded comments
   ═══════════════════════════════════════════════════ */
function InlineComments({ targetType, targetId }: { targetType: string; targetId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: sess } = await supabase.auth.getSession()
      const uid = sess?.session?.user?.id

      const { data } = await supabase
        .from('comments')
        .select('id, content, created_at, parent_comment_id, depth, profiles:user_id(username, avatar_url), votes(vote_type, user_id)')
        .eq('target_type', targetType).eq('target_id', targetId)
        .order('created_at', { ascending: true })

      if (!data) { setLoading(false); return }

      const map = new Map<string, any>()
      const roots: any[] = []
      data.forEach((r: any) => {
        let up = 0, down = 0, uv: 'up' | 'down' | null = null
        r.votes?.forEach((v: any) => { if (v.vote_type === 'up') up++; else down++; if (uid && v.user_id === uid) uv = v.vote_type })
        const c = { ...r, username: r.profiles?.username || 'user', avatar_url: r.profiles?.avatar_url, upvotes: up, downvotes: down, userVote: uv, replies: [] }
        map.set(c.id, c)
        if (r.parent_comment_id && map.has(r.parent_comment_id)) map.get(r.parent_comment_id).replies.push(c)
        else roots.push(c)
      })
      setComments(roots)
      setLoading(false)
    }
    load()
  }, [targetType, targetId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    const res = await addComment(targetType, targetId, text, replyTo || undefined)
    if (res?.comment) {
      const nc = { id: res.comment.id, username: 'tú', avatar_url: null, content: res.comment.content, created_at: res.comment.created_at, upvotes: 0, downvotes: 0, userVote: null, replies: [] }
      if (!replyTo) setComments(p => [...p, nc])
      else {
        // Simple refetch for replies
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data } = await supabase.from('comments').select('id, content, created_at, parent_comment_id, depth, profiles:user_id(username, avatar_url)').eq('target_type', targetType).eq('target_id', targetId).order('created_at', { ascending: true })
        if (data) {
          const map2 = new Map<string, any>(); const roots2: any[] = []
          data.forEach((r: any) => { const c2 = { ...r, username: r.profiles?.username || 'user', avatar_url: r.profiles?.avatar_url, upvotes: 0, downvotes: 0, userVote: null, replies: [] }; map2.set(c2.id, c2); if (r.parent_comment_id && map2.has(r.parent_comment_id)) map2.get(r.parent_comment_id).replies.push(c2); else roots2.push(c2) })
          setComments(roots2)
        }
      }
    }
    setText(''); setReplyTo(null); setSubmitting(false)
  }

  if (loading) return <div className="py-4 flex justify-center"><Loader2 size={16} className="animate-spin text-text-dark/30" /></div>

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-xs text-text-dark/30 text-center py-3">No hay comentarios aún.</p>
      )}
      {comments.map(c => <MiniComment key={c.id} c={c} depth={0} onReply={setReplyTo} />)}

      {user && (
        <form onSubmit={submit} className="flex items-center gap-2 pt-2 border-t border-border-dark/10">
          {replyTo && (
            <button type="button" onClick={() => setReplyTo(null)} className="text-[10px] text-[#B8A080] hover:underline shrink-0">✕ respuesta</button>
          )}
          <input
            value={text} onChange={e => setText(e.target.value)}
            placeholder={replyTo ? 'Escribe tu respuesta...' : 'Escribe un comentario...'}
            disabled={submitting}
            className="flex-1 px-3 py-2 rounded-lg bg-[#F8F7F4] border border-border-dark/10 text-xs text-text-dark placeholder:text-text-dark/30 outline-none focus:border-accent/50"
          />
          <button type="submit" disabled={!text.trim() || submitting}
            className="p-2 rounded-full bg-[#1A1612] text-white disabled:opacity-30 transition-colors">
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          </button>
        </form>
      )}
    </div>
  )
}

/* ── Mini comment ── */
function MiniComment({ c, depth, onReply }: { c: any; depth: number; onReply: (id: string) => void }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(c.userVote)
  const [ups, setUps] = useState(c.upvotes)
  const [downs, setDowns] = useState(c.downvotes)

  const doVote = async (t: 'up' | 'down') => {
    const prev = vote
    setVote(vote === t ? null : t)
    if (t === 'up') { if (prev === 'up') setUps((u: number) => u - 1); else { setUps((u: number) => u + 1); if (prev === 'down') setDowns((d: number) => d - 1) } }
    else { if (prev === 'down') setDowns((d: number) => d - 1); else { setDowns((d: number) => d + 1); if (prev === 'up') setUps((u: number) => u - 1) } }
    const res = await toggleVote('comment', c.id, t)
    if (res?.error) setVote(prev)
  }

  return (
    <div className={depth > 0 ? 'ml-6 pl-3 border-l-2 border-border-dark/10' : ''}>
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded-full bg-[#E5E0D8] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[9px] font-bold text-text-dark/50">{c.username[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-text-dark">@{c.username}</span>
            <span className="text-[10px] text-text-dark/30">{timeAgo(c.created_at)}</span>
          </div>
          <p className="text-xs text-text-dark/70 mt-0.5 leading-relaxed">{c.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => onReply(c.id)} className="text-[10px] font-bold text-text-dark/30 hover:text-text-dark uppercase tracking-wider">Responder</button>
            <button onClick={() => doVote('up')} className={`flex items-center gap-0.5 text-[10px] font-semibold ${vote === 'up' ? 'text-green-600' : 'text-text-dark/30 hover:text-text-dark'}`}>
              <ThumbsUp size={10} className={vote === 'up' ? 'fill-current' : ''} /> {ups}
            </button>
            <button onClick={() => doVote('down')} className={`flex items-center gap-0.5 text-[10px] font-semibold ${vote === 'down' ? 'text-red-500' : 'text-text-dark/30 hover:text-text-dark'}`}>
              <ThumbsDown size={10} className={vote === 'down' ? 'fill-current' : ''} /> {downs}
            </button>
          </div>
        </div>
      </div>
      {c.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {c.replies.map((r: any) => <MiniComment key={r.id} c={r} depth={depth + 1} onReply={onReply} />)}
        </div>
      )}
    </div>
  )
}
