import { notFound } from 'next/navigation'
import { getProfileData } from '@/app/actions/profile'
import { createClient } from '@/lib/supabase/server'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ActivityTabs from '@/components/profile/ActivityTabs'
import Navbar from '@/components/navbar/Navbar'

interface PageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params
  const profile = await getProfileData(resolvedParams.username)
  if (!profile) return { title: 'Usuario no encontrado' }
  
  return {
    title: `${profile.display_name || profile.username} - Opinext`,
    description: profile.bio || `Perfil de ${profile.username} en Opinext.`
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  const profile = await getProfileData(resolvedParams.username)
  
  if (!profile) {
    notFound()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isCurrentUser = user?.id === profile.id

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />
        
        {!profile.isBlocked && (
          <ActivityTabs userId={profile.id} />
        )}
      </div>

    </main>
  )
}
