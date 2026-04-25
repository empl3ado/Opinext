'use client'

import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar/Navbar'
import ReelViewer from '@/components/reels/ReelViewer'

export default function ListPage({ params }: { params: { id: string } }) {
  const router = useRouter()

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
        <ReelViewer mode="listas" initialId={params.id} />
      </div>
    </div>
  )
}
