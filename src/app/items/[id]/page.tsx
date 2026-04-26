'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import ReelViewer from '@/components/reels/ReelViewer'
import DetailPanel from '@/components/detail/DetailPanel'
import { useState } from 'react'
import { use } from 'react'

export default function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [activeId, setActiveId] = useState(resolvedParams.id)

  return (
    <div className="min-h-[100dvh] w-full bg-bg-secondary flex flex-col">
      <div className="h-[100dvh] w-full overflow-hidden shrink-0 relative">
        <Navbar 
          mode="items" 
          onModeChange={(newMode) => {
            if (newMode === 'listas') {
              router.push('/?mode=listas')
            }
          }} 
          isTransparent={true} 
        />
        <ReelViewer 
          mode="items" 
          initialId={resolvedParams.id} 
          onActiveItemChange={(id) => setActiveId(id)}
        />
      </div>

      <section className="min-h-[100dvh] w-full bg-white relative z-10">
        <DetailPanel type="item" id={activeId} />
      </section>
    </div>
  )
}
