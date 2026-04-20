'use client'

import { useState } from 'react'
import { X, Upload, XCircle, Loader2 } from 'lucide-react'
import { updateList } from '@/app/actions/lists'
import { uploadMedia } from '@/app/actions/create'
import { useAuth } from '@/components/auth/AuthProvider'
import Image from 'next/image'

interface EditListModalProps {
  list: any
  onClose: () => void
  onSuccess: () => void
}

export default function EditListModal({ list, onClose, onSuccess }: EditListModalProps) {
  const { user } = useAuth()
  
  const [title, setTitle] = useState(list.title || '')
  const [description, setDescription] = useState(list.description || '')
  const [isCollaborative, setIsCollaborative] = useState(list.is_collaborative || false)
  
  // Archivos a subir
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  // Archivos existentes que el usuario quiere borrar explícitamente
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0])
      setRemoveExistingImage(false)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
      setRemoveExistingVideo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    try {
      let finalImageUrl = list.cover_image_url
      let finalVideoUrl = list.video_url

      if (removeExistingImage) finalImageUrl = null
      if (removeExistingVideo) finalVideoUrl = null

      // Subir nueva imagen si hay
      if (coverImageFile) {
        finalImageUrl = await uploadMedia(coverImageFile, 'list-covers', user.id)
      }

      // Subir nuevo video si hay
      if (videoFile) {
        finalVideoUrl = await uploadMedia(videoFile, 'list-covers', user.id)
      }

      const updates = {
        title,
        description,
        is_collaborative: isCollaborative,
        cover_image_url: finalImageUrl,
        video_url: finalVideoUrl
      }

      const res = await updateList(list.id, updates)
      if (res.error) {
        setError(res.error)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-bg-secondary rounded-[2rem] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-serif text-text-primary">Editar Lista</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors text-text-dark/50">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form id="edit-list-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-2">Título</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-black/5 border border-transparent focus:border-text-dark/20 rounded-xl px-4 py-3 outline-none text-text-dark font-serif text-lg"
                placeholder="Ej. Mejores lugares para leer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-2">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-black/5 border border-transparent focus:border-text-dark/20 rounded-xl px-4 py-3 outline-none text-text-dark text-sm min-h-[120px] resize-none"
                placeholder="Añade contexto o reglas a tu lista..."
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="is-collab"
                checked={isCollaborative}
                onChange={e => setIsCollaborative(e.target.checked)}
                className="w-5 h-5 accent-[#8C7A5B] cursor-pointer rounded-md"
              />
              <div>
                <label htmlFor="is-collab" className="font-semibold text-text-dark cursor-pointer select-none">Lista Colaborativa</label>
                <p className="text-xs text-text-dark/60 mt-0.5">Permite a otros usuarios proponer y añadir elementos a esta lista.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-4">Imagen de Portada</label>
                
                {list.cover_image_url && !removeExistingImage && !coverImageFile && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-black/10">
                    <Image src={list.cover_image_url} alt="Current cover" fill className="object-cover" />
                    <button type="button" onClick={() => setRemoveExistingImage(true)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md">
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
                
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-black/10 rounded-xl hover:bg-black/5 transition-colors cursor-pointer text-text-dark/60">
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs font-semibold">{coverImageFile ? coverImageFile.name : 'Sube una nueva imagen'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              {/* Video */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-4">Video de Portada (Opcional)</label>
                
                {list.video_url && !removeExistingVideo && !videoFile && (
                  <div className="relative w-full bg-black rounded-xl overflow-hidden mb-3 border border-black/10 aspect-video max-h-48 flex items-center justify-center">
                    <span className="text-white text-xs z-10">Video Actual</span>
                    <video src={list.video_url} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <button type="button" onClick={() => setRemoveExistingVideo(true)} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors backdrop-blur-md z-20">
                      <XCircle size={16} />
                    </button>
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-black/10 rounded-xl hover:bg-black/5 transition-colors cursor-pointer text-text-dark/60">
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs font-semibold">{videoFile ? videoFile.name : 'Sube un nuevo video'}</span>
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                </label>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-bg-page/50">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full font-semibold text-text-dark/60 hover:text-text-dark hover:bg-black/5 transition-colors text-sm">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-list-form" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-text-dark text-bg-primary font-semibold text-sm hover:bg-text-dark/90 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
