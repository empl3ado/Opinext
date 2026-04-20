'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { CreationType } from './CreateModal'
import { Upload, X, Loader2, MapPin, Tag, CheckCircle } from 'lucide-react'
import { fetchCategories, createList, createItem, CreateListParams, CreateItemParams } from '@/app/actions/create'
import { useRouter } from 'next/navigation'

// Tipos
interface Category {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

interface LocationResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface CreateFormProps {
  type: CreationType
  onClose: () => void
}

export default function CreateForm({ type, onClose }: CreateFormProps) {
  // Estados principales
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ id: string, type: 'list' | 'item' } | null>(null)
  
  const router = useRouter()

  // Categorías
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSubCat, setSelectedSubCat] = useState('')

  // Tags
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Autocomplete Nominatim
  const [locationQuery, setLocationQuery] = useState('')
  const [locationResults, setLocationResults] = useState<LocationResult[]>([])
  const [isSearchingLoc, setIsSearchingLoc] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<{name: string, lat: number, lng: number} | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch Categorías al montar
  useEffect(() => {
    fetchCategories().then(data => {
      if (data) setCategories(data as any)
    })
  }, [])

  // Nominatim Debounce
  useEffect(() => {
    if (!locationQuery || selectedLoc?.name === locationQuery) {
      setLocationResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingLoc(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5`)
        const data = await res.json()
        setLocationResults(data)
      } catch (err) {
        console.error('Error fetching location:', err)
      } finally {
        setIsSearchingLoc(false)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [locationQuery, selectedLoc])

  // Handlers
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const url = URL.createObjectURL(file)
      setMediaPreview(url)
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const selectLocation = (loc: LocationResult) => {
    setSelectedLoc({
      name: loc.display_name,
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon)
    })
    setLocationQuery(loc.display_name)
    setLocationResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    if (mediaFile) formData.append('media', mediaFile)

    try {
      if (type === 'list') {
        const params: CreateListParams = {
          title, description, 
          categoryId: selectedCat || undefined, 
          subcategoryId: selectedSubCat || undefined,
          locationName: selectedLoc?.name,
          lat: selectedLoc?.lat,
          lng: selectedLoc?.lng,
          isCollaborative,
          tags
        }
        const res = await createList(params, formData)
        if (res?.error) throw new Error(res.error)
        setSuccessData({ id: res.listId, type: 'list' })
      } else {
        const params: CreateItemParams = {
          title, description, 
          categoryId: selectedCat || undefined, 
          subcategoryId: selectedSubCat || undefined,
          locationName: selectedLoc?.name,
          lat: selectedLoc?.lat,
          lng: selectedLoc?.lng,
          tags
        }
        const res = await createItem(params, formData)
        if (res?.error) throw new Error(res.error)
        setSuccessData({ id: res.itemId, type: 'item' })
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentCategory = categories.find(c => c.id === selectedCat)

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
        <CheckCircle className="text-green-500 w-16 h-16" />
        <h3 className="text-2xl font-bold text-text-dark">¡Publicado con éxito!</h3>
        <p className="text-text-dark/60">Tu {successData.type === 'list' ? 'lista' : 'ítem'} ya está disponible en Opinext.</p>
        <div className="pt-6 flex gap-4 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-text-dark/60 bg-black/5 hover:bg-black/10 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onClose()
              router.push(`/${successData.type === 'list' ? 'lists' : 'items'}/${successData.id}`)
            }}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-text-primary bg-bg-primary hover:bg-bg-primary/90 transition-colors shadow-lg"
          >
            Ver {successData.type === 'list' ? 'Lista' : 'Ítem'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

      {/* Media Upload (Drag/Click) */}
      <div className="relative">
        {!mediaPreview ? (
          <div 
            className="w-full h-40 sm:h-52 border-2 border-dashed border-border-dark/20 rounded-2xl flex flex-col items-center justify-center bg-black/5 hover:bg-black/10 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="text-text-dark/40 mb-2" size={32} />
            <p className="text-sm font-medium text-text-dark/60">Haz clic o arrastra un archivo</p>
            <p className="text-xs text-text-dark/40 mt-1">Imágenes (JPG, PNG) o Videos (MP4)</p>
          </div>
        ) : (
          <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden bg-black">
            {mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview} className="w-full h-full object-cover opacity-80" muted loop autoPlay playsInline />
            ) : (
              <img src={mediaPreview} className="w-full h-full object-cover opacity-80" alt="Preview" />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleMediaChange} 
          className="hidden" 
          accept="image/*,video/mp4,video/quicktime" 
        />
      </div>

      <div className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Nombre de tu ${type === 'list' ? 'Lista' : 'Ítem'}...`}
            className="w-full px-4 py-3 bg-white border border-border-dark/10 rounded-xl text-text-dark placeholder:text-text-dark/30 focus:border-accent/50 outline-none transition-colors"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Cuéntanos más al respecto..."
            className="w-full px-4 py-3 bg-white border border-border-dark/10 rounded-xl text-text-dark placeholder:text-text-dark/30 focus:border-accent/50 outline-none transition-colors min-h-[100px] resize-y"
          />
        </div>

        {/* Categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1">Categoría</label>
            <select
              value={selectedCat}
              onChange={e => { setSelectedCat(e.target.value); setSelectedSubCat('') }}
              className="w-full px-4 py-3 bg-white border border-border-dark/10 rounded-xl text-text-dark focus:border-accent/50 outline-none transition-colors"
            >
              <option value="">Selecciona una...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1">Subcategoría</label>
            <select
              value={selectedSubCat}
              onChange={e => setSelectedSubCat(e.target.value)}
              disabled={!selectedCat || (currentCategory?.subcategories.length || 0) === 0}
              className="w-full px-4 py-3 bg-white border border-border-dark/10 rounded-xl text-text-dark focus:border-accent/50 outline-none transition-colors disabled:opacity-50"
            >
              <option value="">Selecciona una...</option>
              {currentCategory?.subcategories.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación (Nominatim Autocomplete) */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1 flex items-center gap-1">
            <MapPin size={12} /> Ubicación
          </label>
          <input
            type="text"
            value={locationQuery}
            onChange={e => {
              setLocationQuery(e.target.value)
              if (selectedLoc) setSelectedLoc(null)
            }}
            placeholder="Ej: Mendoza, Argentina..."
            className="w-full px-4 py-3 bg-white border border-border-dark/10 rounded-xl text-text-dark placeholder:text-text-dark/30 focus:border-accent/50 outline-none transition-colors"
          />
          {isSearchingLoc && <Loader2 size={16} className="absolute right-4 top-10 animate-spin text-text-dark/30" />}
          
          {locationResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-border-dark/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {locationResults.map(loc => (
                <button
                  key={loc.place_id}
                  type="button"
                  onClick={() => selectLocation(loc)}
                  className="w-full text-left px-4 py-3 text-sm text-text-dark hover:bg-black/5 border-b border-border-dark/5 last:border-0"
                >
                  {loc.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags / Metadatos */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-text-dark/50 mb-1.5 ml-1 flex items-center gap-1">
            <Tag size={12} /> Metadatos (Tags)
          </label>
          <div className="w-full p-2 bg-white border border-border-dark/10 rounded-xl flex flex-wrap gap-2 focus-within:border-accent/50 transition-colors">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-black/5 text-text-dark rounded-lg text-sm">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 opacity-60 hover:opacity-100">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "Escribe y presiona Enter..." : ""}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-dark px-2 py-1"
            />
          </div>
        </div>

        {/* Opciones Especiales Listas */}
        {type === 'list' && (
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-border-dark/10 bg-white hover:bg-black/5 transition-colors">
              <input 
                type="checkbox" 
                checked={isCollaborative}
                onChange={e => setIsCollaborative(e.target.checked)}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="text-sm font-semibold text-text-dark">Lista Colaborativa</div>
                <div className="text-xs text-text-dark/50 mt-0.5">Permitir que otros usuarios añadan ítems a esta lista.</div>
              </div>
            </label>
          </div>
        )}

      </div>

      <div className="pt-6 border-t border-border-dark/10 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-full text-sm font-medium text-text-dark/60 hover:text-text-dark hover:bg-black/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-bg-primary text-text-primary hover:bg-bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          <span>Publicar {type === 'list' ? 'Lista' : 'Ítem'}</span>
        </button>
      </div>

    </form>
  )
}
