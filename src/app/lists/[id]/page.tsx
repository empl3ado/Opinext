'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import { getListDetails, incrementViewCount, deleteList } from '@/app/actions/lists'
import { useAuth } from '@/components/auth/AuthProvider'
import { Heart, MessageCircle, Share2, Pencil, Trash2, MapPin } from 'lucide-react'
import ReviewSection from '@/components/reviews/ReviewSection'
import CommentSection from '@/components/comments/CommentSection'
import EditListModal from '@/components/lists/EditListModal'
import BuyButton from '@/components/shop/BuyButton'
import ListItemsSection from '@/components/lists/ListItemsSection'

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, profile } = useAuth()
  
  const [list, setList] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'comments' | 'reviews'>('info')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchList = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      const data = await getListDetails(id)
      if (data) {
        setList(data)
        incrementViewCount(id)
      }
      setLoading(false)
    }
    fetchList()
  }, [params])

  if (loading) return <div className="min-h-screen bg-bg-page flex items-center justify-center">Cargando...</div>
  if (!list) return <div className="min-h-screen bg-bg-page flex items-center justify-center font-serif text-2xl">Lista no encontrada</div>

  const isOwner = user?.id === list.user_id
  const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'mod'
  const canEdit = isOwner
  const canDelete = isOwner || isAdminOrMod

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente esta lista? Esta acción no se puede deshacer.')) {
      setIsDeleting(true)
      const res = await deleteList(list.id)
      if (res.success) {
        router.push('/lists')
      } else {
        alert(res.error || 'Error al eliminar')
        setIsDeleting(false)
      }
    }
  }

  const handleUpdateSuccess = async () => {
    setIsEditModalOpen(false)
    const resolvedParams = await params
    const updatedData = await getListDetails(resolvedParams.id)
    if (updatedData) setList(updatedData)
  }

  return (
    <main className="min-h-screen bg-bg-page flex flex-col">
      <Navbar mode="listas" onModeChange={() => {}} isTransparent />

      {/* Cover */}
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-[#E5E0D8]">
        {list.cover_image_url && (
          <Image src={list.cover_image_url} alt={list.title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-white">
            <div className="flex gap-2 mb-3">
              {list.categories?.name && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm">
                  {list.categories.name}
                </span>
              )}
              {list.subcategories?.name && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/20 backdrop-blur-md rounded-full shadow-sm">
                  {list.subcategories.name}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif leading-tight drop-shadow-md mb-2">
              {list.title}
            </h1>
            {list.location && (
              <p className="flex items-center gap-2 text-white/80 text-sm md:text-base drop-shadow">
                <MapPin className="w-4 h-4" /> {list.location}
              </p>
            )}
            {/* Si fue editada */}
            {new Date(list.updated_at).getTime() > new Date(list.created_at).getTime() + 1000 && (
              <p className="text-[10px] text-white/60 mt-4 italic tracking-wider">
                Editada el {new Date(list.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {canEdit && (
              <button onClick={() => setIsEditModalOpen(true)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors" title="Editar Lista">
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={isDeleting} className="w-10 h-10 rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-md flex items-center justify-center text-white transition-colors" title="Eliminar Permanentemente">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors">
              <Heart className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex-1 flex flex-col md:flex-row gap-12">
        {/* Left Column */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex border-b border-border-dark/10 mb-8">
            <button onClick={() => setActiveTab('info')} className={`pb-4 mr-8 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'info' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              Información
              {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
            <button onClick={() => setActiveTab('items')} className={`pb-4 mr-8 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'items' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              Items / Respuestas
              {activeTab === 'items' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`pb-4 mr-8 text-sm font-semibold tracking-wider uppercase transition-colors relative ${activeTab === 'reviews' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              Reseñas
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
            <button onClick={() => setActiveTab('comments')} className={`pb-4 text-sm font-semibold tracking-wider uppercase transition-colors relative flex items-center gap-2 ${activeTab === 'comments' ? 'text-text-dark' : 'text-text-dark/40 hover:text-text-dark/60'}`}>
              <MessageCircle size={16} /> Comentarios
              {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-dark" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="pb-24">
            {activeTab === 'info' && (
              <div>
                <p className="text-text-dark/80 text-lg leading-relaxed whitespace-pre-wrap font-serif">
                  {list.description || 'Sin descripción.'}
                </p>
                {list.video_url && (
                  <div className="mt-8 rounded-2xl overflow-hidden bg-black aspect-video relative">
                    <video src={list.video_url} controls className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'items' && (
              <ListItemsSection listId={list.id} isCollaborative={list.is_collaborative} isOwner={isOwner} />
            )}
            
            {activeTab === 'reviews' && (
              <div>
                <ReviewSection targetId={list.id} />
                <div className="py-8 text-center text-text-dark/40 text-sm font-medium">
                  No hay reseñas para mostrar.
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <CommentSection targetId={list.id} />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Creator Info) */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm sticky top-24">
            <h4 className="text-xs font-bold tracking-widest text-text-dark/40 uppercase mb-4">Creador</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black/5 overflow-hidden shrink-0 relative">
                {list.profiles?.avatar_url ? (
                  <Image src={list.profiles.avatar_url} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif bg-[#E5E0D8]">
                    {(list.profiles?.display_name || list.profiles?.username)?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-text-dark">{list.profiles?.display_name || `@${list.profiles?.username}`}</p>
                <p className="text-xs text-text-dark/60">{list.is_collaborative ? 'Lista Colaborativa' : 'Lista Privada'}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-black/5 flex justify-between text-center">
              <div>
                <p className="text-xl font-serif text-text-dark">{list.view_count}</p>
                <p className="text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mt-1">Vistas</p>
              </div>
            </div>

            {list.is_commercial && (
              <div className="mt-8 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-black/5 border border-black/5 text-center">
                  <span className="text-xs font-bold text-text-dark/40 uppercase tracking-widest block mb-1">Precio</span>
                  <span className="text-3xl font-serif text-text-dark">${list.price || 'Consultar'}</span>
                </div>
                <BuyButton 
                  sellerId={list.user_id} 
                  productTitle={list.title} 
                  price={list.price} 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditListModal 
          list={list} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={handleUpdateSuccess} 
        />
      )}
    </main>
  )
}
