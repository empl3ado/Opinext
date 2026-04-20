'use server'

import { createClient } from '@/lib/supabase/server'
import { ProfileData } from './profile'

export type ActivityItem = {
  id: string
  type: 'list_created' | 'item_created' | 'rating' | 'comment' | 'follow'
  userId: string
  userProfile: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  createdAt: string
  // Data for lists/items
  targetId?: string
  targetTitle?: string
  targetDescription?: string
  targetImage?: string
  // Data for ratings
  rating?: number
  reviewText?: string
  // Data for comments
  content?: string
  // Data for follows
  followingUsername?: string
}

export async function getJournalFeed(): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const currentUserId = user.id

  // 1. Obtener la red del usuario: Amigos y Seguimientos
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', currentUserId)

  const { data: friendships } = await supabase
    .from('friendships')
    .select('user_id1, user_id2')
    .eq('status', 'accepted')
    .or(`user_id1.eq.${currentUserId},user_id2.eq.${currentUserId}`)

  const networkIds = new Set<string>()
  networkIds.add(currentUserId) // Ver mi propia actividad también

  if (follows) follows.forEach(f => networkIds.add(f.following_id))
  if (friendships) {
    friendships.forEach(f => {
      networkIds.add(f.user_id1)
      networkIds.add(f.user_id2)
    })
  }

  const networkArray = Array.from(networkIds)

  // 2. Extraer actividades (simulando fan-out con pull-based en tiempo real)
  const [
    { data: lists },
    { data: items },
    { data: ratings },
    { data: comments },
    { data: recentFollows }
  ] = await Promise.all([
    supabase.from('lists').select('id, user_id, title, description, cover_image_url, created_at, profiles(username, display_name, avatar_url)').in('user_id', networkArray).order('created_at', { ascending: false }).limit(20),
    supabase.from('items').select('id, user_id, title, description, image_url, created_at, profiles(username, display_name, avatar_url)').in('user_id', networkArray).order('created_at', { ascending: false }).limit(20),
    supabase.from('ratings').select('id, user_id, rating, review_text, target_type, target_id, created_at, profiles(username, display_name, avatar_url)').in('user_id', networkArray).not('review_text', 'is', null).order('created_at', { ascending: false }).limit(20),
    supabase.from('comments').select('id, user_id, content, target_type, target_id, created_at, profiles(username, display_name, avatar_url)').in('user_id', networkArray).order('created_at', { ascending: false }).limit(20),
    supabase.from('follows').select('id, follower_id, following_id, created_at, follower:profiles!follower_id(username, display_name, avatar_url), following:profiles!following_id(username)').in('follower_id', networkArray).order('created_at', { ascending: false }).limit(10)
  ])

  // 3. Obtener info extra para los targets de ratings y comentarios (opcional para títulos, pero necesario para una UI rica)
  const targetIds = [
    ...(ratings || []).map(r => r.target_id),
    ...(comments || []).map(c => c.target_id)
  ].filter(Boolean)

  let targetsDict: Record<string, { title: string, image?: string }> = {}
  
  if (targetIds.length > 0) {
    const [{ data: tgtLists }, { data: tgtItems }] = await Promise.all([
      supabase.from('lists').select('id, title, cover_image_url').in('id', targetIds),
      supabase.from('items').select('id, title, image_url').in('id', targetIds)
    ])
    tgtLists?.forEach(l => { targetsDict[l.id] = { title: l.title, image: l.cover_image_url } })
    tgtItems?.forEach(i => { targetsDict[i.id] = { title: i.title, image: i.image_url } })
  }

  // 4. Formatear y Unificar todo en ActivityItem
  let feed: ActivityItem[] = []

  lists?.forEach(l => {
    feed.push({
      id: `list_${l.id}`,
      type: 'list_created',
      userId: l.user_id,
      userProfile: l.profiles as any,
      createdAt: l.created_at,
      targetId: l.id,
      targetTitle: l.title,
      targetDescription: l.description,
      targetImage: l.cover_image_url
    })
  })

  items?.forEach(i => {
    feed.push({
      id: `item_${i.id}`,
      type: 'item_created',
      userId: i.user_id,
      userProfile: i.profiles as any,
      createdAt: i.created_at,
      targetId: i.id,
      targetTitle: i.title,
      targetDescription: i.description,
      targetImage: i.image_url
    })
  })

  ratings?.forEach(r => {
    feed.push({
      id: `rating_${r.id}`,
      type: 'rating',
      userId: r.user_id,
      userProfile: r.profiles as any,
      createdAt: r.created_at,
      targetId: r.target_id,
      rating: r.rating,
      reviewText: r.review_text,
      targetTitle: targetsDict[r.target_id]?.title || 'un elemento',
      targetImage: targetsDict[r.target_id]?.image
    })
  })

  comments?.forEach(c => {
    feed.push({
      id: `comment_${c.id}`,
      type: 'comment',
      userId: c.user_id,
      userProfile: c.profiles as any,
      createdAt: c.created_at,
      targetId: c.target_id,
      content: c.content,
      targetTitle: targetsDict[c.target_id]?.title || 'un elemento'
    })
  })

  recentFollows?.forEach(f => {
    feed.push({
      id: `follow_${f.id}`,
      type: 'follow',
      userId: f.follower_id,
      userProfile: f.follower as any,
      createdAt: f.created_at,
      followingUsername: (f.following as any).username
    })
  })

  // 5. Ordenar por fecha DESC
  feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Limitar a los 50 más recientes para rendimiento
  return feed.slice(0, 50)
}

export async function getProfileSuggestions(limit = 4) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    // Si no está logueado, devolver al azar
    const { data } = await supabase.from('profiles').select('username, display_name, avatar_url, bio').limit(limit)
    return data || []
  }

  // Lógica simple: Excluir mis amigos, la gente que sigo, y a mi mismo.
  const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
  const excludeIds = new Set<string>()
  excludeIds.add(user.id)
  if (follows) follows.forEach(f => excludeIds.add(f.following_id))

  const excludeArray = Array.from(excludeIds)

  // En PostgreSQL no hay un fácil 'NOT IN' si el array es muy grande y se combina con LIMIT RANDOM, pero para nuestro caso sirve
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, bio')
    .not('id', 'in', `(${excludeArray.join(',')})`)
    .limit(limit)

  return data || []
}
