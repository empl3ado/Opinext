'use client'

import { useState, useEffect, Suspense } from 'react'
import Navbar from '@/components/navbar/Navbar'
import ScrollExpandHero from '@/components/hero/ScrollExpandHero'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

function HomePageContent() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as 'listas' | 'items') || 'listas'
  
  const [mode, setMode] = useState<'listas' | 'items'>(initialMode)
  const [isExpanded, setIsExpanded] = useState(false)
  const [preview, setPreview] = useState<any>(null)

  useEffect(() => {
    const fetchRandom = async () => {
      const supabase = createClient()
      setPreview(null) // reset while fetching

      if (mode === 'listas') {
        const { data } = await supabase
          .from('lists')
          .select('id, title, cover_image_url, categories(name), profiles:user_id(username)')
          .eq('is_published', true)
          .limit(10)
        
        if (data && data.length > 0) {
          const randomList: any = data[Math.floor(Math.random() * data.length)]
          setPreview({
            id: randomList.id,
            title: randomList.title,
            image: randomList.cover_image_url || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
            author: Array.isArray(randomList.profiles) ? randomList.profiles[0]?.username : randomList.profiles?.username || 'usuario',
            tag: Array.isArray(randomList.categories) ? randomList.categories[0]?.name : randomList.categories?.name || 'Lista'
          })
        }
      } else {
        const { data } = await supabase
          .from('items')
          .select('id, content, image_url, profiles:user_id(username)')
          .limit(10)
          
        if (data && data.length > 0) {
          const randomItem: any = data[Math.floor(Math.random() * data.length)]
          setPreview({
            id: randomItem.id,
            title: randomItem.content || 'Sin descripción',
            image: randomItem.image_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
            author: Array.isArray(randomItem.profiles) ? randomItem.profiles[0]?.username : randomItem.profiles?.username || 'usuario',
            tag: 'Item'
          })
        }
      }
    }
    fetchRandom()
  }, [mode])

  return (
    <>
      <Navbar
        mode={mode}
        onModeChange={setMode}
        isTransparent={!isExpanded}
      />

      <ScrollExpandHero
        mode={mode}
        onFullyExpanded={setIsExpanded}
        preview={preview}
      />
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-secondary" />}>
      <HomePageContent />
    </Suspense>
  )
}

