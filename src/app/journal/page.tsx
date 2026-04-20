import { getJournalFeed, getProfileSuggestions } from '@/app/actions/journal'
import Navbar from '@/components/navbar/Navbar'
import JournalFeed from '@/components/journal/JournalFeed'
import SuggestionsSidebar from '@/components/journal/SuggestionsSidebar'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Journal - Opinext',
  description: 'A curated chronicle of taste, discovery, and shared insights across the estate.'
}

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // We allow rendering for unauthenticated users, they will just see empty states or empty feeds
  const feed = await getJournalFeed()
  const suggestions = await getProfileSuggestions(3)

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-24 pb-32 flex flex-col lg:flex-row gap-16">
        
        {/* Left Column (Feed) */}
        <div className="flex-1 w-full max-w-3xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-serif text-text-dark mb-4 tracking-tight">Journal</h1>
            <p className="text-lg md:text-xl text-text-dark/60 font-serif max-w-xl leading-relaxed">
              A curated chronicle of taste, discovery, and shared insights across the estate.
            </p>
          </div>
          
          <JournalFeed feed={feed} />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="hidden lg:block w-[320px] shrink-0 pt-4">
          <SuggestionsSidebar suggestions={suggestions} isAuthenticated={!!user} />
        </div>
      </div>
    </main>
  )
}
