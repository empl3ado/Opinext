'use client'

import React, { createContext, useContext, useState } from 'react'

interface ModalContextType {
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const openCreateModal = () => setIsCreateModalOpen(true)
  const closeCreateModal = () => setIsCreateModalOpen(false)

  return (
    <ModalContext.Provider value={{ isCreateModalOpen, openCreateModal, closeCreateModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
