'use client'

import { useState, useRef } from 'react'
import { X, Upload, Loader2, CheckCircle, ShieldAlert } from 'lucide-react'
import { submitReport } from '@/app/actions/profile'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetId: string
  targetType: 'profile' | 'list' | 'item' | 'comment'
  targetName: string
}

const REPORT_REASONS = [
  'Contenido inapropiado / Ofensivo',
  'Spam / Promoción no deseada',
  'Acoso o Bullying',
  'Identidad falsa / Suplantación',
  'Información engañosa',
  'Otro'
]

export default function ReportModal({ isOpen, onClose, targetId, targetType, targetName }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0])
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    if (file) {
      formData.append('proof_image', file)
    }

    const res = await submitReport(targetId, targetType, reason, description, formData)
    
    setIsSubmitting(false)
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-black/5">
          <div className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-xl font-bold font-serif">Reportar {targetType === 'profile' ? 'Usuario' : 'Contenido'}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-text-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
              <CheckCircle className="text-green-500 w-16 h-16" />
              <h3 className="text-2xl font-bold text-text-dark">Reporte Enviado</h3>
              <p className="text-text-dark/60">Gracias por ayudarnos a mantener Opinext seguro. Nuestro equipo revisará el caso.</p>
              <button
                onClick={onClose}
                className="mt-4 w-full py-3 rounded-xl font-semibold text-text-primary bg-bg-primary hover:bg-bg-primary/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-text-dark/60">
                Estás reportando a: <strong className="text-text-dark">{targetName}</strong>
              </p>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

              {/* Categoría */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-text-dark/60 uppercase">Motivo del reporte</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white border border-black/10 focus:border-black/20 focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-text-dark"
                >
                  {REPORT_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-text-dark/60 uppercase">Detalles adicionales</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Por favor, provee más contexto sobre el reporte..."
                  className="w-full p-4 rounded-xl bg-white border border-black/10 focus:border-black/20 focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-text-dark resize-none min-h-[120px]"
                  required
                />
              </div>

              {/* Imagen (Prueba) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-text-dark/60 uppercase">Adjuntar Evidencia (Opcional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                {!file ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-black/15 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-black/5 hover:border-black/30 transition-all text-text-dark/50"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Sube una captura de pantalla</span>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 flex items-center justify-center group">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFile(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Reporte'}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  )
}
