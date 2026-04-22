'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:profiles!conversations_user1_id_fkey(username, display_name, avatar_url),
      user2:profiles!conversations_user2_id_fkey(username, display_name, avatar_url),
      messages(content, created_at)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  return data
}

export async function getOrCreateConversation(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }
  if (user.id === targetUserId) return { error: 'No puedes chatear contigo mismo' }

  // Asegurar orden para la llave única (user1_id < user2_id)
  const [u1, u2] = [user.id, targetUserId].sort()

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .single()

  if (existing) return { conversationId: existing.id }

  const { data: newConv, error } = await supabase
    .from('conversations')
    .insert({ user1_id: u1, user2_id: u2 })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { conversationId: newConv.id }
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })

  if (error) return { error: error.message }

  // Actualizar updated_at de la conversación
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath('/messages')
  return { success: true }
}
