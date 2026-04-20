'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'admin'
  birth_date: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAuthModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
})

export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const supabase = createClient()

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), [])

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data as Profile)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }, [user?.id, fetchProfile])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id)
      }

      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          // Small delay to let the trigger create the profile
          if (event === 'SIGNED_IN') {
            closeAuthModal() // Close modal on successful sign in
            setTimeout(() => fetchProfile(newSession.user.id), 500)
          } else {
            await fetchProfile(newSession.user.id)
          }
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile, closeAuthModal])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ 
      user, profile, session, isLoading, signOut, refreshProfile,
      isAuthModalOpen, openAuthModal, closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  )
}
