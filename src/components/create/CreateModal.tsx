'use client'

import { useModal } from '@/contexts/ModalContext'
import { X, ListTree, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import CreateForm from './CreateForm'

export type CreationType = 'list' | 'item'

export default function CreateModal() {
  const { isCreateModalOpen, closeCreateModal } = useModal()
  const [activeType, setActiveType] = useState<CreationType>('list')
  const [isClosing, setIsClosing] = useState(false)

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCreateModalOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      closeCreateModal()
    }, 300) // Match transition duration
  }

  if (!isCreateModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-5xl h-[90vh] sm:h-[80vh] bg-bg-page rounded-2xl sm:rounded-[2rem] shadow-2xl flex flex-col sm:flex-row overflow-hidden transition-all duration-300 ease-out transform ${
        isClosing ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}>
        
        {/* Close button (Mobile: Top Right, Desktop: Hidden or inside) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/5 hover:bg-black/10 text-text-dark sm:hidden transition-colors"
        >
          <X size={20} />
        </button>

        {/* Sidebar (Left on desktop, Top on mobile) */}
        <div className="w-full sm:w-64 bg-white border-b sm:border-b-0 sm:border-r border-border-dark/10 p-4 sm:p-6 flex flex-col shrink-0 relative z-10">
          <div className="hidden sm:flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl text-text-dark tracking-tight">Crear</h2>
          </div>
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-dark/40 mb-3 sm:mb-4 px-2">Tipo de publicación</h3>
          
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            <button
              onClick={() => setActiveType('list')}
              className={`flex items-center gap-3 w-full p-3 sm:px-4 sm:py-3.5 rounded-xl transition-all whitespace-nowrap sm:whitespace-normal text-left ${
                activeType === 'list' 
                  ? 'bg-bg-primary text-text-primary shadow-sm' 
                  : 'text-text-dark/70 hover:bg-black/5'
              }`}
            >
              <ListTree size={20} className={activeType === 'list' ? 'text-accent' : ''} />
              <div>
                <div className="font-medium text-sm sm:text-base">Nueva Lista</div>
                <div className={`text-xs mt-0.5 hidden sm:block ${activeType === 'list' ? 'text-text-primary/70' : 'text-text-dark/40'}`}>
                  Agrupa múltiples lugares o experiencias
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveType('item')}
              className={`flex items-center gap-3 w-full p-3 sm:px-4 sm:py-3.5 rounded-xl transition-all whitespace-nowrap sm:whitespace-normal text-left ${
                activeType === 'item' 
                  ? 'bg-bg-primary text-text-primary shadow-sm' 
                  : 'text-text-dark/70 hover:bg-black/5'
              }`}
            >
              <Package size={20} className={activeType === 'item' ? 'text-accent' : ''} />
              <div>
                <div className="font-medium text-sm sm:text-base">Ítem Individual</div>
                <div className={`text-xs mt-0.5 hidden sm:block ${activeType === 'item' ? 'text-text-primary/70' : 'text-text-dark/40'}`}>
                  Publica algo suelto (restaurante, producto, etc.)
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Form Container (Right side) */}
        <div className="flex-1 overflow-y-auto bg-bg-page relative">
          {/* Desktop Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-border-dark/5 text-text-dark hidden sm:block transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="p-4 sm:p-8 max-w-3xl mx-auto">
            <CreateForm type={activeType} onClose={handleClose} />
          </div>
        </div>

      </div>
    </div>
  )
}
