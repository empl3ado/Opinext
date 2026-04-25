'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import ReelViewer from '@/components/reels/ReelViewer'
import DetailPanel from '@/components/detail/DetailPanel'
import { useState } from 'react'

export default function ItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeId, setActiveId] = useState(params.id)

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
          isTransparent={false} 
        />
        <ReelViewer 
          mode="items" 
          initialId={params.id} 
          onActiveItemChange={(id) => setActiveId(id)}
        />
      </div>

      <section className="min-h-[100dvh] w-full bg-white relative z-10">
        <DetailPanel type="item" id={activeId} />
      </section>
    </div>
  )
}
