'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadMedia } from './create'

export interface ProfileData {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
  following_count: number
  rating_avg: number
  isFollowing: boolean
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  isBlocked: boolean
}

// -----------------------------------------------------------------------------
// OBTENCIÓN DE DATOS DEL PERFIL
// -----------------------------------------------------------------------------
export async function getProfileData(username: string): Promise<ProfileData | null> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Buscar perfil por username
  const { data: targetProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileErr || !targetProfile) return null

  const targetId = targetProfile.id

  // 1. Seguidores / Siguiendo
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', targetId)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', targetId)

  // 2. Rating promedio (ratings de las listas e items que este usuario creó)
  // Como no tenemos una tabla unificada, traeremos ratings donde list_id o item_id pertenezcan a este usuario.
  // Por simplicidad de esta query, si el target user es el creador del item/list, obtenemos sus reviews.
  const { data: userLists } = await supabase.from('lists').select('id').eq('user_id', targetId)
  const { data: userItems } = await supabase.from('items').select('id').eq('user_id', targetId)
  
  const listIds = userLists?.map(l => l.id) || []
  const itemIds = userItems?.map(i => i.id) || []

  let rating_avg = 0
  if (listIds.length > 0 || itemIds.length > 0) {
    let query = supabase.from('ratings').select('rating')
    if (listIds.length > 0 && itemIds.length > 0) {
      query = query.or(`list_id.in.(${listIds.join(',')}),item_id.in.(${itemIds.join(',')})`)
    } else if (listIds.length > 0) {
      query = query.in('list_id', listIds)
    } else {
      query = query.in('item_id', itemIds)
    }
    const { data: ratingsData } = await query
    if (ratingsData && ratingsData.length > 0) {
      const sum = ratingsData.reduce((acc, r) => acc + r.rating, 0)
      rating_avg = sum / ratingsData.length
    }
  }

  // Si no está logueado, retornamos la data básica
  if (!currentUser) {
    return {
      ...targetProfile,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      rating_avg: Number(rating_avg.toFixed(1)),
      isFollowing: false,
      friendshipStatus: 'none',
      isBlocked: false
    }
  }

  // 3. Relaciones si está logueado
  // Follow
  const { data: follow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', currentUser.id)
    .eq('following_id', targetId)
    .single()

  // Bloqueo
  const { data: block } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', currentUser.id)
    .eq('blocked_id', targetId)
    .single()

  // Amistad
  let friendshipStatus: ProfileData['friendshipStatus'] = 'none'
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(user_id1.eq.${currentUser.id},user_id2.eq.${targetId}),and(user_id1.eq.${targetId},user_id2.eq.${currentUser.id})`)
    .single()

  if (friendship) {
    if (friendship.status === 'accepted') {
      friendshipStatus = 'accepted'
    } else if (friendship.user_id1 === currentUser.id) {
      friendshipStatus = 'pending_sent'
    } else {
      friendshipStatus = 'pending_received'
    }
  }

  return {
    ...targetProfile,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
    rating_avg: Number(rating_avg.toFixed(1)),
    isFollowing: !!follow,
    friendshipStatus,
    isBlocked: !!block
  }
}

// -----------------------------------------------------------------------------
// MUTACIONES DE RELACIONES (Follow, Friend, Block)
// -----------------------------------------------------------------------------

export async function toggleFollow(targetId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
    .single()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
  }

  revalidatePath(`/${username}`)
  return { success: true }
}

export async function toggleBlock(targetId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { data: existing } = await supabase
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', targetId)
    .single()

  if (existing) {
    await supabase.from('blocks').delete().eq('id', existing.id)
  } else {
    await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: targetId })
    // Al bloquear, eliminar posibles follows o amistades
    await supabase.from('follows').delete().or(`and(follower_id.eq.${user.id},following_id.eq.${targetId}),and(follower_id.eq.${targetId},following_id.eq.${user.id})`)
    await supabase.from('friendships').delete().or(`and(user_id1.eq.${user.id},user_id2.eq.${targetId}),and(user_id1.eq.${targetId},user_id2.eq.${user.id})`)
  }

  revalidatePath(`/${username}`)
  return { success: true }
}

export async function sendFriendRequest(targetId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  await supabase.from('friendships').insert({
    user_id1: user.id,
    user_id2: targetId,
    status: 'pending'
  })

  revalidatePath(`/${username}`)
  return { success: true }
}

export async function acceptFriendRequest(targetId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  await supabase.from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id1', targetId)
    .eq('user_id2', user.id)

  revalidatePath(`/${username}`)
  return { success: true }
}

export async function removeFriendship(targetId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  await supabase.from('friendships')
    .delete()
    .or(`and(user_id1.eq.${user.id},user_id2.eq.${targetId}),and(user_id1.eq.${targetId},user_id2.eq.${user.id})`)

  revalidatePath(`/${username}`)
  return { success: true }
}

// -----------------------------------------------------------------------------
// REPORTES
// -----------------------------------------------------------------------------
export async function submitReport(targetId: string, targetType: 'profile' | 'list' | 'item' | 'comment', reason: string, description: string, formData?: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para reportar.' }

  let proofImageUrl = null
  if (formData) {
    const file = formData.get('proof_image') as File | null
    if (file && file.size > 0) {
      proofImageUrl = await uploadMedia(file, 'report-proofs', user.id)
    }
  }

  const { error } = await supabase.from('reports').insert({
    user_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    description,
    proof_image_url: proofImageUrl
  })

  if (error) {
    console.error('Error submitting report:', error)
    return { error: 'Error al enviar el reporte. Inténtalo más tarde.' }
  }

  return { success: true }
}

// -----------------------------------------------------------------------------
// ACTIVIDAD DEL USUARIO (TABS)
// -----------------------------------------------------------------------------
export async function getUserActivity(userId: string, tab: 'lists' | 'items' | 'reviews' | 'comments') {
  const supabase = await createClient()

  if (tab === 'lists') {
    const { data } = await supabase
      .from('lists')
      .select('id, title, description, cover_image_url, created_at, categories(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return data || []
  }

  if (tab === 'items') {
    const { data } = await supabase
      .from('items')
      .select('id, title, description, image_url, created_at, categories(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return data || []
  }

  if (tab === 'reviews') {
    const { data } = await supabase
      .from('ratings')
      .select(`
        id, rating, review_text, created_at,
        lists(id, title),
        items(id, title)
      `)
      .eq('user_id', userId)
      .not('review_text', 'is', null)
      .order('created_at', { ascending: false })
    return data || []
  }

  if (tab === 'comments') {
    const { data } = await supabase
      .from('comments')
      .select(`
        id, content, created_at,
        lists(id, title),
        items(id, title),
        list_items(id, description)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return data || []
  }

  return []
}
