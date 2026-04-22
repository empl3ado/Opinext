'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar/Navbar'
import { getShopItems, ShopFilter } from '@/app/actions/shop'
import { getCategoriesWithSubcategories } from '@/app/actions/lists'
import { Search, MapPin, SlidersHorizontal, ShoppingBag, Star, Eye, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [filters, setFilters] = useState<ShopFilter>({
    type: 'all',
    sortBy: 'recent',
    location: ''
  })

  useEffect(() => {
    const init = async () => {
      const cats = await getCategoriesWithSubcategories()
      setCategories(cats)
      await fetchItems()
    }
    init()
  }, [])

  const fetchItems = async (currentFilters = filters) => {
    setLoading(true)
    const data = await getShopItems(currentFilters)
    setItems(data)
    setLoading(false)
  }

  const handleFilterChange = (updates: Partial<ShopFilter>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    fetchItems(newFilters)
  }

  return (
    <main className="min-h-screen bg-bg-page flex flex-col">
      <Navbar mode="listas" onModeChange={() => {}} />

      {/* Hero / Header */}
      <div className="bg-text-dark text-bg-primary pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif mb-4">Marketplace</h1>
            <p className="text-bg-primary/60 max-w-xl text-lg">
              Descubre productos y servicios exclusivos de la comunidad Opinext. Calidad verificada por personas reales.
            </p>
          </div>
          
          {/* Main Selector */}
          <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-2xl self-start md:self-auto">
            {['all', 'product', 'service'].map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange({ type: t as any })}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
                  filters.type === t ? 'bg-white text-black shadow-lg scale-105' : 'text-white/60 hover:text-white'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'product' ? 'Productos' : 'Servicios'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-40 bg-bg-page/80 backdrop-blur-xl border-b border-black/5 py-4 px-6 md:px-12 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark/30 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Filtrar por ubicación..."
              className="w-full bg-black/5 border-none rounded-full pl-12 pr-6 py-2.5 text-sm focus:ring-2 focus:ring-text-dark/10 transition-all outline-none"
              value={filters.location}
              onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
            />
          </div>

          <select 
            className="bg-black/5 border-none rounded-full px-6 py-2.5 text-sm outline-none focus:ring-2 focus:ring-text-dark/10 appearance-none"
            onChange={(e) => handleFilterChange({ categoryId: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            className="bg-black/5 border-none rounded-full px-6 py-2.5 text-sm outline-none focus:ring-2 focus:ring-text-dark/10 appearance-none"
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
          >
            <option value="recent">Más recientes</option>
            <option value="trending">En tendencia</option>
            <option value="rating">Mejor valorados</option>
            <option value="price_low">Precio: Menor a Mayor</option>
            <option value="price_high">Precio: Mayor a Menor</option>
          </select>

          <button className="w-10 h-10 flex items-center justify-center bg-black/5 rounded-full hover:bg-black/10 transition-colors">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            <p className="text-text-dark/40 font-serif italic text-lg">Preparando el catálogo...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32">
            <ShoppingBag className="w-16 h-16 text-text-dark/10 mx-auto mb-6" />
            <p className="text-2xl font-serif text-text-dark/40 italic">Parece que aún no hay ofertas en esta categoría...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => (
              <Link 
                key={item.id} 
                href={`/${item.entry_type === 'list' ? 'lists' : 'items'}/${item.id}`}
                className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-black/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="aspect-[4/5] relative bg-[#E5E0D8]">
                  <Image 
                    src={item.cover_image_url || item.image_url || '/placeholder.png'} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[9px] font-bold text-white uppercase tracking-widest shadow-xl">
                    {item.commercial_type || 'Vendedor Verificado'}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <span className="text-white font-serif text-2xl">${item.price || 'Consultar'}</span>
                    <button className="px-6 py-2 bg-white text-black text-xs font-bold rounded-full uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                      Ver detalle
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-black/5 overflow-hidden relative">
                       {item.profiles?.avatar_url && <Image src={item.profiles.avatar_url} alt="" fill className="object-cover" />}
                    </div>
                    <span className="text-[10px] font-bold text-text-dark/40 uppercase tracking-wider">{item.profiles?.username || 'Anon'}</span>
                  </div>
                  <h3 className="text-xl font-serif text-text-dark mb-2 line-clamp-1 group-hover:text-[#8C7A5B] transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-dark/40">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {item.avg_rating || 'N/A'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-dark/40">
                      <Eye className="w-3 h-3" /> {item.view_count || 0}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-text-dark/40">
                      <Heart className="w-3 h-3" /> {item.likes_count || 0}
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
