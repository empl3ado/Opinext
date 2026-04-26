'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import ReelViewer from '@/components/reels/ReelViewer'
import { use } from 'react'

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-bg-secondary flex flex-col">
      <Navbar 
        mode="listas" 
        onModeChange={(newMode) => {
          if (newMode === 'items') {
            router.push('/?mode=items')
          }
        }} 
        isTransparent={false} 
      />
      <div className="h-14 w-full shrink-0" />
      <div className="w-full flex-1 relative">
        <ReelViewer mode="listas" initialId={resolvedParams.id} />
      </div>
    </div>
  )
}
