'use client'

import { useState, useRef } from 'react'
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { submitReview } from '@/app/actions/social'

interface ReviewSectionProps {
  targetId: string
}

export default function ReviewSection({ targetId }: ReviewSectionProps) {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return // No rating given
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('targetId', targetId)
      formData.append('rating', rating.toString())
      formData.append('content', content)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await submitReview(formData)

      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        // Reset
        setRating(0)
        setContent('')
        removeImage()
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
      setError('Ocurrió un error inesperado al enviar la reseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-border-dark/10 rounded-2xl p-5 shadow-sm relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl z-10 flex items-center justify-center">
          <Loader2 size={24} className="text-bg-primary animate-spin" />
        </div>
      )}

      <h3 className="font-serif text-lg text-text-dark mb-4">Escribe tu reseña</h3>
      
      {error && <p className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded-md">{error}</p>}
      {success && <p className="text-green-600 text-xs mb-3 font-medium bg-green-50 p-2 rounded-md">¡Reseña publicada con éxito!</p>}

      <form onSubmit={handleSubmit}>
        {/* Star Rating Input */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-text-dark/50 uppercase tracking-widest mb-2">Tu puntaje</p>
          <div className="text-text-dark [&_.text-text-primary]:!text-text-dark [&_.text-text-secondary]:!text-bg-primary">
            <StarRating
              rating={rating}
              interactive={true}
              onRate={setRating}
              size={24}
              count={rating}
            />
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-4 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tu experiencia (opcional)..."
            className="w-full min-h-[100px] p-4 bg-bg-page border border-border-dark/10 rounded-xl text-sm text-text-dark placeholder:text-text-dark/30 outline-none focus:border-bg-primary/50 transition-colors resize-none disabled:opacity-50"
            disabled={isSubmitting}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 relative inline-block group">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-24 w-24 object-cover rounded-lg border border-border-dark/10"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 text-text-dark border border-border-dark/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark/60 hover:text-text-dark hover:bg-black/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <ImageIcon size={18} />
              <span>Añadir foto</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex items-center gap-2 bg-bg-primary text-text-primary px-5 py-2.5 rounded-full font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-primary/90 transition-colors shadow-sm"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>Publicar</span>
          </button>
        </div>
      </form>
    </div>
  )
}
