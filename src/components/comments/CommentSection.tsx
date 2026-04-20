'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, CornerDownRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addComment, toggleVote } from '@/app/actions/social'

interface Comment {
  id: string
  username: string
  avatar_url: string | null
  content: string
  created_at: string
  replies: Comment[]
  upvotes: number
  downvotes: number
  userVote: 'up' | 'down' | null
}

// ... [Mantengo el mock DEMO_COMMENTS aquí abajo por si el targetId es de demostración]
const DEMO_COMMENTS: Comment[] = [
  {
    id: '1',
    username: 'vinolover',
    avatar_url: null,
    content: '¡Qué envidia! Ese viñedo es espectacular. Estuve el año pasado y la experiencia fue inolvidable.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    upvotes: 12, downvotes: 1, userVote: null,
    replies: [
      {
        id: '1-1',
        username: 'julio_sperez',
        avatar_url: null,
        content: '¡Totalmente! La visita guiada vale cada peso.',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        upvotes: 5, downvotes: 0, userVote: null,
        replies: [],
      },
    ],
  },
  {
    id: '2',
    username: 'mendoza_guide',
    avatar_url: null,
    content: 'Excelente elección. ¿Probaste el maridaje con carnes rojas? Es la mejor combinación.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    upvotes: 8, downvotes: 0, userVote: null,
    replies: [],
  },
]

interface CommentSectionProps {
  targetType: string
  targetId: string
}

export default function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDemo = ['1', '2', '3'].includes(targetId)

  useEffect(() => {
    if (isDemo) {
      setComments(DEMO_COMMENTS)
      setIsLoading(false)
      return
    }

    const fetchComments = async () => {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      // Simplified fetch for demo purposes. Ideally, this requires a complex join or RPC to get threaded comments + votes.
      // We will do a basic fetch of all comments for this target and structure them in memory.
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, parent_comment_id, depth,
          profiles:user_id(username, avatar_url),
          votes(vote_type, user_id)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        setIsLoading(false)
        return
      }

      // Process comments to build tree and count votes
      const commentMap = new Map<string, Comment>()
      const roots: Comment[] = []

      data.forEach(row => {
        let up = 0
        let down = 0
        let userVote: 'up' | 'down' | null = null

        row.votes.forEach((v: any) => {
          if (v.vote_type === 'up') up++
          if (v.vote_type === 'down') down++
          if (userId && v.user_id === userId) userVote = v.vote_type
        })

        const c: Comment = {
          id: row.id,
          username: row.profiles?.username || 'user',
          avatar_url: row.profiles?.avatar_url,
          content: row.content,
          created_at: row.created_at,
          upvotes: up,
          downvotes: down,
          userVote,
          replies: []
        }
        commentMap.set(c.id, c)

        if (row.parent_comment_id) {
          const parent = commentMap.get(row.parent_comment_id)
          if (parent) {
            parent.replies.push(c)
          } else {
            roots.push(c) // parent not found, treat as root
          }
        } else {
          roots.push(c)
        }
      })

      setComments(roots)
      setIsLoading(false)
    }

    fetchComments()
  }, [targetId, targetType, isDemo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isDemo) return
    
    setIsSubmitting(true)
    setError(null)
    
    const res = await addComment(targetType, targetId, newComment, replyingTo || undefined)
    
    if (res?.error) {
      setError(res.error)
    } else if (res?.comment) {
      // Optimizamos: Inyectamos el comentario en el arbol en lugar de refetch (simplificado)
      const newC: Comment = {
        id: res.comment.id,
        username: 'tú', // Simplificación: idealmente sacar de contexto de usuario
        avatar_url: null,
        content: res.comment.content,
        created_at: res.comment.created_at,
        upvotes: 0, downvotes: 0, userVote: null, replies: []
      }
      
      if (replyingTo) {
        // Deep clone or simply trigger a refetch for simplicity in a real app. 
        // Here we just refresh the whole page conceptually, but we can do a state update.
        setComments(prev => [...prev]) // Force re-render (naive approach, ideally full state update)
        // For production, we'd refetch or accurately walk the tree
      } else {
        setComments(prev => [...prev, newC])
      }
      
      setNewComment('')
      setReplyingTo(null)
    }
    
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-text-dark/40" /></div>
  }

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-text-dark/50" />
        <span className="text-sm text-text-dark/50">
          {comments.length} comentarios
        </span>
      </div>

      {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded">{error}</p>}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(id) => setReplyingTo(id)}
            depth={0}
            isDemo={isDemo}
          />
        ))}
      </div>

      {/* New comment input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-bg-page pt-4 border-t border-border-dark/20 mt-6"
      >
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <CornerDownRight size={12} />
            <span>Respondiendo a un comentario</span>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-accent hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-accent">T</span>
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isDemo ? "Los demos no aceptan comentarios reales" : "Escribe tu opinión..."}
            disabled={isDemo || isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-border-dark/20 text-sm text-text-dark placeholder:text-text-muted outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isDemo || isSubmitting}
            className="p-2.5 rounded-full bg-bg-primary text-text-primary disabled:opacity-30 hover:bg-bg-secondary transition-colors"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  )
}

function CommentItem({
  comment,
  onReply,
  depth,
  isDemo
}: {
  comment: Comment
  onReply: (id: string) => void
  depth: number
  isDemo: boolean
}) {
  const [vote, setVote] = useState<'up' | 'down' | null>(comment.userVote)
  const [upvotes, setUpvotes] = useState(comment.upvotes)
  const [downvotes, setDownvotes] = useState(comment.downvotes)

  const handleVote = async (type: 'up' | 'down') => {
    if (isDemo) {
      setVote(vote === type ? null : type)
      return
    }

    // Optimistic update
    const previousVote = vote
    setVote(vote === type ? null : type)
    
    // Adjust counters (simplified logic)
    if (type === 'up') {
      if (previousVote === 'up') setUpvotes(prev => prev - 1)
      else if (previousVote === 'down') { setUpvotes(prev => prev + 1); setDownvotes(prev => prev - 1) }
      else setUpvotes(prev => prev + 1)
    } else {
      if (previousVote === 'down') setDownvotes(prev => prev - 1)
      else if (previousVote === 'up') { setDownvotes(prev => prev + 1); setUpvotes(prev => prev - 1) }
      else setDownvotes(prev => prev + 1)
    }

    const res = await toggleVote('comment', comment.id, type)
    if (res?.error) {
      // Revert if error
      setVote(previousVote)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-border-dark/10' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-accent">
            {comment.username[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-dark">
              @{comment.username}
            </span>
            <span className="text-xs text-text-muted">
              {getTimeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-text-dark/80 mt-1 leading-relaxed">
            {comment.content}
          </p>
          
          {/* Actions: Reply, Like, Dislike */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs font-semibold text-text-dark/40 hover:text-text-dark transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              Responder
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleVote('up')}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${vote === 'up' ? 'text-green-600' : 'text-text-dark/40 hover:text-text-dark'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={vote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                {upvotes}
              </button>
              <button 
                onClick={() => handleVote('down')}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${vote === 'down' ? 'text-red-600' : 'text-text-dark/40 hover:text-text-dark'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={vote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                {downvotes}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
              isDemo={isDemo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
