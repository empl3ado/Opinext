'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar/Navbar'
import { getLists, getCategoriesWithSubcategories, GetListsFilter } from '@/app/actions/lists'
import { Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react'

export default function ListsPage() {
  const [lists, setLists] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [categoryId, setCategoryId] = useState<string>('')
  const [subcategoryId, setSubcategoryId] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'popular'>('recent')

  useEffect(() => {
    getCategoriesWithSubcategories().then(data => setCategories(data))
  }, [])

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true)
      const data = await getLists({ categoryId, subcategoryId, location, sortBy })
      setLists(data)
      setLoading(false)
    }
    fetchLists()
  }, [categoryId, subcategoryId, location, sortBy])

  const activeCategory = categories.find(c => c.id === categoryId)

  return (
    <main className="min-h-screen bg-bg-page pb-24">
      <Navbar mode="listas" onModeChange={() => {}} />

      <div className="pt-24 max-w-7xl mx-auto px-6 md:px-12">
        {/* Header y Filtros */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-serif text-text-dark mb-6 tracking-tight">Explorar Listas</h1>
          
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-black/5">
            {/* Buscar Ubicación */}
            <div className="flex-1 relative flex items-center bg-black/5 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-text-dark/40 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar por ubicación (ej. Buenos Aires)..."
                className="bg-transparent w-full outline-none text-text-dark placeholder:text-text-dark/40 text-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Categoría */}
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSubcategoryId('')
                }}
                className="w-full md:w-48 appearance-none bg-black/5 rounded-xl px-4 py-3 text-sm text-text-dark outline-none cursor-pointer"
              >
                <option value="">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dark/40" />
            </div>

            {/* Subcategoría (Condicional) */}
            {activeCategory && activeCategory.subcategories.length > 0 && (
              <div className="relative">
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full md:w-48 appearance-none bg-black/5 rounded-xl px-4 py-3 text-sm text-text-dark outline-none cursor-pointer"
                >
                  <option value="">Subcategoría</option>
                  {activeCategory.subcategories.map((sc: any) => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dark/40" />
              </div>
            )}

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-40 appearance-none bg-black/5 rounded-xl px-4 py-3 text-sm font-semibold text-text-dark outline-none cursor-pointer"
              >
                <option value="recent">Más Recientes</option>
                <option value="popular">Más Likes</option>
                <option value="trending">En Tendencia</option>
              </select>
              <SlidersHorizontal className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-dark/40" />
            </div>
          </div>
        </div>

        {/* Grid de Listas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-[400px] bg-black/5 rounded-[2rem]" />)}
          </div>
        ) : lists.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-xl font-serif italic text-text-dark/40">No se encontraron listas con estos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <Link href={`/lists/${list.id}`} key={list.id} className="group relative h-[400px] rounded-[2rem] overflow-hidden block border border-black/5">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10" />
                {list.cover_image_url ? (
                  <Image src={list.cover_image_url} alt={list.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-[#E5E0D8]" />
                )}
                
                {/* Overlay details */}
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      {list.categories?.name && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white w-fit shadow-sm">
                          {list.categories.name}
                        </span>
                      )}
                      {list.location && (
                        <span className="text-[10px] font-semibold flex items-center gap-1 text-white/90 drop-shadow-md">
                          <MapPin className="w-3 h-3" /> {list.location}
                        </span>
                      )}
                    </div>
                    {/* Badge Likes */}
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold tracking-widest uppercase">
                      {list.savesCount} Likes
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-6 -mb-6 p-6 pt-12">
                    <h3 className="text-2xl md:text-3xl font-serif leading-tight text-white mb-2 drop-shadow-lg">
                      {list.title}
                    </h3>
                    <p className="text-sm text-white/80 line-clamp-2">
                      {list.description}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-white/60 text-xs">
                      <span>Por {list.profiles?.display_name || `@${list.profiles?.username}`}</span>
                      <span>•</span>
                      <span>{list.view_count} vistas</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
