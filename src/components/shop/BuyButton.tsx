'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { getOrCreateConversation, sendMessage } from '@/app/actions/chat'
import { useAuth } from '@/components/auth/AuthProvider'

interface BuyButtonProps {
  sellerId: string
  productTitle: string
  price?: number
}

export default function BuyButton({ sellerId, productTitle, price }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleBuy = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comprar.')
      return
    }

    if (user.id === sellerId) {
      alert('No puedes comprar tu propio producto.')
      return
    }

    setLoading(true)
    try {
      const res = await getOrCreateConversation(sellerId)
      
      if (res.error) {
        alert(res.error)
      } else if (res.conversationId) {
        // Enviar mensaje automático inicial
        const message = `Hola! Estoy interesado en el producto "${productTitle}"${price ? ` (Precio: $${price})` : ''}. Me gustaría coordinar la compra.`
        await sendMessage(res.conversationId, message)
        
        // Redirigir al chat
        router.push(`/messages?id=${res.conversationId}`)
      }
    } catch (err) {
      console.error('Error in handleBuy:', err)
      alert('Ocurrió un error al intentar contactar al vendedor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#8C7A5B] text-white font-bold text-lg hover:bg-[#6D5E46] transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Comprar ahora
        </>
      )}
    </button>
  )
}
