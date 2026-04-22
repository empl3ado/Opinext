'use server'

import { createClient } from '@/lib/supabase/server'

export interface ShopFilter {
  type: 'product' | 'service' | 'all'
  categoryId?: string
  subcategoryId?: string
  location?: string
  sortBy?: 'recent' | 'popular' | 'trending' | 'price_low' | 'price_high' | 'rating'
}

export async function getShopItems(filters: ShopFilter) {
  const supabase = await createClient()

  // Buscaremos tanto en 'lists' como en 'items' que sean comerciales
  // Para simplificar el marketplace, podríamos unificarlos o buscar por separado.
  // El usuario dice "publicar LISTAS y ITEMS" comerciales.
  
  let listsQuery = supabase
    .from('lists')
    .select(`
      *,
      profiles ( username, display_name, avatar_url, role ),
      categories ( name ),
      subcategories ( name )
    `)
    .eq('is_commercial', true)
    .eq('is_published', true)
    .eq('seller_status', 'active')

  let itemsQuery = supabase
    .from('items')
    .select(`
      *,
      profiles ( username, display_name, avatar_url, role ),
      categories ( name ),
      subcategories ( name )
    `)
    .eq('is_commercial', true)
    .eq('is_published', true)
    .eq('seller_status', 'active')

  if (filters.type !== 'all') {
    listsQuery = listsQuery.eq('commercial_type', filters.type)
    itemsQuery = itemsQuery.eq('commercial_type', filters.type)
  }

  if (filters.categoryId) {
    listsQuery = listsQuery.eq('category_id', filters.categoryId)
    itemsQuery = itemsQuery.eq('category_id', filters.categoryId)
  }

  if (filters.subcategoryId) {
    listsQuery = listsQuery.eq('subcategory_id', filters.subcategoryId)
    itemsQuery = itemsQuery.eq('subcategory_id', filters.subcategoryId)
  }

  if (filters.location) {
    listsQuery = listsQuery.ilike('location', `%${filters.location}%`)
    itemsQuery = itemsQuery.ilike('location', `%${filters.location}%`)
  }

  const [listsRes, itemsRes] = await Promise.all([listsQuery, itemsQuery])

  if (listsRes.error) console.error('Error fetching commercial lists:', listsRes.error)
  if (itemsRes.error) console.error('Error fetching commercial items:', itemsRes.error)

  const listsData = (listsRes.data || []).map(l => ({ ...l, entry_type: 'list' }))
  const itemsData = (itemsRes.data || []).map(i => ({ ...i, entry_type: 'item' }))

  let allData = [...listsData, ...itemsData]

  // Ordenamiento manual en JS para unificar ambas tablas
  allData.sort((a, b) => {
    if (filters.sortBy === 'price_low') return (a.price || 0) - (b.price || 0)
    if (filters.sortBy === 'price_high') return (b.price || 0) - (a.price || 0)
    if (filters.sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0)
    if (filters.sortBy === 'trending' || filters.sortBy === 'popular') return (b.view_count || 0) - (a.view_count || 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return allData
}

export async function getSellerStats(userId: string) {
  const supabase = await createClient()

  const [listsRes, itemsRes] = await Promise.all([
    supabase.from('lists').select('view_count, price').eq('user_id', userId).eq('is_commercial', true),
    supabase.from('items').select('view_count, price').eq('user_id', userId).eq('is_commercial', true)
  ])

  const lists = listsRes.data || []
  const items = itemsRes.data || []

  const totalViews = [...lists, ...items].reduce((acc, curr) => acc + (curr.view_count || 0), 0)
  const totalProducts = lists.length + items.length

  return {
    totalViews,
    totalProducts,
    lists,
    items
  }
}
