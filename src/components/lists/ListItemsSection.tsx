'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Send, Image as ImageIcon, X, Loader2, Video } from 'lucide-react'
import { getListItems, createListItem } from '@/app/actions/lists'
import { useAuth } from '@/components/auth/AuthProvider'

interface ListItemsSectionProps {
  listId: string
  isCollaborative: boolean
  isOwner: boolean
}

export default function ListItemsSection({ listId, isCollaborative, isOwner }: ListItemsSectionProps) {
  const { user } = useAuth()
  
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAdd = isOwner || isCollaborative

  useEffect(() => {
    const fetchItems = async () => {
      const data = await getListItems(listId)
      setItems(data)
      setLoading(false)
    }
    fetchItems()
  }, [listId])

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      setIsVideo(file.type.startsWith('video/'))
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setIsVideo(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      if (mediaFile) {
        formData.append('media', mediaFile)
      }

      const res = await createListItem({
        listId,
        title: title.trim(),
        description: description.trim()
      }, formData)

      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTitle('')
        setDescription('')
        removeMedia()
        
        // Refresh list items
        const newItems = await getListItems(listId)
        setItems(newItems)

        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-text-dark/40" /></div>
  }

  return (
    <div className="space-y-8">
      {/* Formulario para agregar item */}
      {canAdd && user && (
        <div className="bg-white border border-border-dark/10 rounded-2xl p-5 shadow-sm relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
              <Loader2 size={24} className="text-bg-primary animate-spin" />
            </div>
          )}

          <h3 className="font-serif text-lg text-text-dark mb-4">Añadir a la Lista</h3>
          
          {error && <p className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded-md">{error}</p>}
          {success && <p className="text-green-600 text-xs mb-3 font-medium bg-green-50 p-2 rounded-md">¡Añadido con éxito!</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del elemento..."
              className="w-full p-4 bg-bg-page border border-border-dark/10 rounded-xl text-sm text-text-dark placeholder:text-text-dark/30 outline-none focus:border-bg-primary/50 transition-colors"
              disabled={isSubmitting}
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción (opcional)..."
              className="w-full min-h-[80px] p-4 bg-bg-page border border-border-dark/10 rounded-xl text-sm text-text-dark placeholder:text-text-dark/30 outline-none focus:border-bg-primary/50 transition-colors resize-none disabled:opacity-50"
              disabled={isSubmitting}
            />

            {mediaPreview && (
              <div className="relative inline-block group">
                {isVideo ? (
                  <video src={mediaPreview} className="h-32 rounded-lg border border-border-dark/10 object-cover" controls />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="h-32 rounded-lg border border-border-dark/10 object-cover" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 text-text-dark border border-border-dark/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark/60 hover:text-text-dark hover:bg-black/5 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ImageIcon size={18} />
                  <span>Añadir foto/video</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="flex items-center gap-2 bg-bg-primary text-text-primary px-5 py-2.5 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-primary/90 transition-colors shadow-sm"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Añadir</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Items */}
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white/50 border border-border-dark/10 rounded-2xl">
            <p className="text-sm font-medium text-text-dark/40 uppercase tracking-widest">Aún no hay elementos</p>
            <p className="text-xs text-text-dark/40 mt-1">
              {canAdd ? 'Sé el primero en aportar a esta lista.' : 'Esta lista aún no tiene contenido.'}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 border border-border-dark/10 shadow-sm flex flex-col md:flex-row gap-5">
              {(item.image_url || item.video_url) && (
                <div className="w-full md:w-40 h-40 shrink-0 rounded-xl overflow-hidden bg-black/5">
                  {item.video_url ? (
                    <video src={item.video_url} controls className="w-full h-full object-cover" />
                  ) : (
                    <Image src={item.image_url} alt={item.title} width={300} height={300} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <h4 className="font-serif text-xl text-text-dark mb-2">{item.title}</h4>
                {item.description && (
                  <p className="text-text-dark/80 text-sm whitespace-pre-wrap leading-relaxed flex-1">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-dark/5">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-black/5 shrink-0 relative">
                    {item.profiles?.avatar_url ? (
                      <Image src={item.profiles.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E5E0D8] text-[10px] font-serif">
                        {item.profiles?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-text-dark/60">
                    Añadido por @{item.profiles?.username}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
