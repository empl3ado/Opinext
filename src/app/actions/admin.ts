'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAllProfiles() {
  const supabase = await createClient()
  
  // Verificar que el solicitante sea admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (adminProfile?.role !== 'admin') {
    throw new Error('No autorizado. Se requiere rol de administrador.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all profiles:', error)
    return []
  }

  return data
}

export async function updateSellerStatus(userId: string, newRole: string, newStatus: string) {
  const supabase = await createClient()

  // Seguridad: Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single()

  if (adminCheck?.role !== 'admin') throw new Error('No autorizado')

  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: newRole,
      seller_status: newStatus 
    })
    .eq('id', userId)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/sellers')
  return { success: true }
}
