'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Toggle Vote (Like / Dislike)
export async function toggleVote(targetType: string, targetId: string, voteType: 'up' | 'down') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para votar.' }

  try {
    // 1. Ver si ya existe un voto del usuario para este elemento
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id, vote_type')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Quitar el voto si es el mismo
        await supabase.from('votes').delete().eq('id', existingVote.id)
      } else {
        // Cambiar el tipo de voto (de up a down, o viceversa)
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
      }
    } else {
      // Crear nuevo voto
      await supabase.from('votes').insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in toggleVote:', error)
    return { error: 'Ocurrió un error al registrar tu voto.' }
  }
}

// Toggle Save (Bookmark)
export async function toggleSave(targetType: string, targetId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para guardar.' }

  try {
    const { data: existingSave } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single()

    if (existingSave) {
      await supabase.from('saves').delete().eq('id', existingSave.id)
    } else {
      await supabase.from('saves').insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in toggleSave:', error)
    return { error: 'Ocurrió un error al guardar el elemento.' }
  }
}

// Add Comment
export async function addComment(targetType: string, targetId: string, content: string, parentId?: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para comentar.' }

  if (!content || content.trim() === '') return { error: 'El comentario no puede estar vacío.' }

  try {
    let depth = 0
    if (parentId) {
      const { data: parent } = await supabase.from('comments').select('depth').eq('id', parentId).single()
      if (parent) depth = parent.depth + 1
    }

    const { data, error } = await supabase.from('comments').insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      content: content.trim(),
      parent_comment_id: parentId || null,
      depth
    }).select().single()

    if (error) throw error

    revalidatePath('/')
    return { success: true, comment: data }
  } catch (error) {
    console.error('Error in addComment:', error)
    return { error: 'Ocurrió un error al publicar tu comentario.' }
  }
}

// Submit Review
export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para dejar una reseña.' }

  const targetId = formData.get('targetId') as string
  const rating = parseFloat(formData.get('rating') as string)
  const content = formData.get('content') as string
  const file = formData.get('image') as File | null

  if (!targetId || !rating || isNaN(rating)) return { error: 'Faltan datos requeridos.' }

  try {
    let imageUrl = null

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtener la URL pública
      const { data: publicUrlData } = supabase.storage
        .from('review-images')
        .getPublicUrl(fileName)
        
      imageUrl = publicUrlData.publicUrl
    }

    // Insertar en la tabla ratings
    const { error } = await supabase.from('ratings').upsert({
      user_id: user.id,
      target_type: 'item',
      target_id: targetId,
      score: rating,
      content: content?.trim() || null,
      image_url: imageUrl
    }, { onConflict: 'user_id, target_type, target_id' })

    if (error) throw error

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in submitReview:', error)
    return { error: 'Ocurrió un error al enviar tu reseña.' }
  }
}
