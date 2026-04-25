'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import ReelViewer from '@/components/reels/ReelViewer'
import { use } from 'react'

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-bg-secondary">
      <Navbar 
        mode="listas" 
        onModeChange={(newMode) => {
          if (newMode === 'items') {
            router.push('/?mode=items')
          }
        }} 
        isTransparent={false} 
      />
      <div className="w-full h-full">
        <ReelViewer mode="listas" initialId={resolvedParams.id} />
      </div>
    </div>
  )
}
