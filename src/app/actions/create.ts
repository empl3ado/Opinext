'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// -- DTOs
export interface CreateListParams {
  title?: string
  description?: string
  categoryId?: string
  subcategoryId?: string
  locationName?: string
  lat?: number
  lng?: number
  isCollaborative: boolean
  tags: string[]
  isCommercial?: boolean
  price?: number
  commercialType?: 'product' | 'service'
}

export interface CreateItemParams {
  title?: string
  description?: string
  categoryId?: string
  subcategoryId?: string
  locationName?: string
  lat?: number
  lng?: number
  tags: string[]
  isCommercial?: boolean
  price?: number
  commercialType?: 'product' | 'service'
}

export async function fetchCategories() {
  const supabase = await createClient()
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      id, 
      name, 
      subcategories(id, name)
    `)
    .order('name')
    
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return categories
}

export async function uploadMedia(file: File, bucket: 'list-covers' | 'item-images' | 'report-proofs', userId: string) {
  const supabase = await createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
    
  return publicUrlData.publicUrl
}

// --------------------------------------------------------
// Lógica compartida para Tags
// --------------------------------------------------------
async function processTags(supabase: any, tagNames: string[]) {
  if (!tagNames || tagNames.length === 0) return []
  
  const tagIds: string[] = []
  
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    if (!slug) continue
    
    // Buscar si existe
    const { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .single()
      
    if (existingTag) {
      tagIds.push(existingTag.id)
    } else {
      // Insertar nuevo tag
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({ name, slug })
        .select('id')
        .single()
        
      if (!error && newTag) {
        tagIds.push(newTag.id)
      }
    }
  }
  
  return tagIds
}

// --------------------------------------------------------
// Creación
// --------------------------------------------------------
export async function createList(params: CreateListParams, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('seller_status')
    .eq('id', user.id)
    .single()

  if (profile?.seller_status === 'debtor') {
    throw new Error('No puedes crear nuevas publicaciones mientras tengas pagos pendientes.')
  }

  try {
    let coverUrl = null
    let videoUrl = null
    const file = formData.get('media') as File | null
    if (file && file.size > 0) {
      const isVideo = file.type.startsWith('video/')
      const uploadedUrl = await uploadMedia(file, 'list-covers', user.id)
      
      if (isVideo) {
        videoUrl = uploadedUrl
      } else {
        coverUrl = uploadedUrl
      }
    }

    // 1. Insert List
    const { data: list, error: listError } = await supabase
      .from('lists')
      .insert({
        user_id: user.id,
        title: params.title || 'Nueva Lista', // Fallback
        description: params.description || null,
        category_id: params.categoryId || null,
        subcategory_id: params.subcategoryId || null,
        location: params.locationName || null,
        lat: params.lat || null,
        lng: params.lng || null,
        cover_image_url: coverUrl,
        video_url: videoUrl,
        is_collaborative: params.isCollaborative,
        is_commercial: params.isCommercial || false,
        price: params.price || null,
        commercial_type: params.commercialType || null
      })
      .select('id')
      .single()

    if (listError) throw listError

    // 2. Process and link Tags
    const tagIds = await processTags(supabase, params.tags)
    if (tagIds.length > 0) {
      const listTagsData = tagIds.map(tag_id => ({
        list_id: list.id,
        tag_id
      }))
      await supabase.from('list_tags').insert(listTagsData)
    }

    revalidatePath('/')
    return { success: true, listId: list.id }
  } catch (error: any) {
    console.error('Error creating list:', error)
    return { error: error.message || 'Ocurrió un error al crear la lista.' }
  }
}

export async function createItem(params: CreateItemParams, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('seller_status')
    .eq('id', user.id)
    .single()

  if (profile?.seller_status === 'debtor') {
    throw new Error('No puedes crear nuevas publicaciones mientras tengas pagos pendientes.')
  }

  try {
    let imageUrl = null
    let videoUrl = null
    const file = formData.get('media') as File | null
    if (file && file.size > 0) {
      const isVideo = file.type.startsWith('video/')
      const uploadedUrl = await uploadMedia(file, 'item-images', user.id)
      
      if (isVideo) {
        videoUrl = uploadedUrl
      } else {
        imageUrl = uploadedUrl
      }
    }

    // 1. Insert Item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        title: params.title || 'Nuevo Ítem', // Fallback
        description: params.description || null,
        category_id: params.categoryId || null,
        subcategory_id: params.subcategoryId || null,
        location: params.locationName || null,
        lat: params.lat || null,
        lng: params.lng || null,
        image_url: imageUrl,
        video_url: videoUrl,
        is_commercial: params.isCommercial || false,
        price: params.price || null,
        commercial_type: params.commercialType || null
      })
      .select('id')
      .single()

    if (itemError) throw itemError

    // 2. Process and link Tags
    const tagIds = await processTags(supabase, params.tags)
    if (tagIds.length > 0) {
      const itemTagsData = tagIds.map(tag_id => ({
        item_id: item.id,
        tag_id
      }))
      await supabase.from('item_tags').insert(itemTagsData)
    }

    revalidatePath('/')
    return { success: true, itemId: item.id }
  } catch (error: any) {
    console.error('Error creating item:', error)
    return { error: error.message || 'Ocurrió un error al crear el ítem.' }
  }
}
