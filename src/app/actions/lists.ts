'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface GetListsFilter {
  categoryId?: string
  subcategoryId?: string
  location?: string
  sortBy?: 'recent' | 'trending' | 'popular'
}

export async function getLists(filters: GetListsFilter) {
  const supabase = await createClient()

  let query = supabase
    .from('lists')
    .select(`
      *,
      profiles ( username, display_name, avatar_url ),
      categories ( name ),
      subcategories ( name ),
      saves ( count )
    `)
    .eq('is_published', true)

  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.subcategoryId) query = query.eq('subcategory_id', filters.subcategoryId)
  if (filters.location) query = query.ilike('location', `%${filters.location}%`)

  // Si sortBy is recent o trending, ordenamos desde DB
  if (filters.sortBy === 'recent' || !filters.sortBy) {
    query = query.order('created_at', { ascending: false })
  } else if (filters.sortBy === 'trending') {
    query = query.order('view_count', { ascending: false })
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching lists:', error)
    return []
  }

  // Supabase REST no permite ORDER BY en joined aggregates, así que lo ordenamos en JS para 'popular'
  let parsedData = data.map(item => ({
    ...item,
    savesCount: item.saves && item.saves[0] ? item.saves[0].count : 0
  }))

  if (filters.sortBy === 'popular') {
    parsedData.sort((a, b) => b.savesCount - a.savesCount)
  }

  return parsedData
}

export async function getListDetails(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      profiles ( id, username, display_name, avatar_url, role ),
      categories ( id, name ),
      subcategories ( id, name )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient()
  // RPC or simple update (update is easier for now)
  // Pero lo ideal sería un rpc. Si no, actualizamos directamente:
  const { data } = await supabase.from('lists').select('view_count').eq('id', id).single()
  if (data) {
    await supabase.from('lists').update({ view_count: data.view_count + 1 }).eq('id', id)
  }
}

export async function updateList(id: string, updates: {
  title?: string
  description?: string
  cover_image_url?: string | null
  video_url?: string | null
  is_collaborative?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Verificar ownership
  const { data: list } = await supabase.from('lists').select('user_id').eq('id', id).single()
  if (!list || list.user_id !== user.id) {
    return { error: 'No tienes permiso para editar esta lista' }
  }

  const { error } = await supabase
    .from('lists')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath(`/lists/${id}`)
  revalidatePath('/lists')
  return { success: true }
}

export async function deleteList(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Check role and ownership
  const [{ data: list }, { data: profile }] = await Promise.all([
    supabase.from('lists').select('user_id').eq('id', id).single(),
    supabase.from('profiles').select('role').eq('id', user.id).single()
  ])

  if (!list) return { error: 'Lista no encontrada' }

  const isOwner = list.user_id === user.id
  const isAdminOrMod = profile?.role === 'admin' || profile?.role === 'mod'

  if (!isOwner && !isAdminOrMod) {
    return { error: 'No tienes permisos suficientes para eliminar' }
  }

  const { error } = await supabase.from('lists').delete().eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/lists')
  return { success: true }
}

export async function getCategoriesWithSubcategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select(`
      id, name,
      subcategories (id, name)
    `)
    .order('sort_order')
  
  return data || []
}
