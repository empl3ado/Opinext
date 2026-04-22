'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import ModeSelector from '@/components/ui/ModeSelector'
import { useAuth } from '@/components/auth/AuthProvider'
import { useModal } from '@/contexts/ModalContext'

interface NavbarProps {
  mode?: 'listas' | 'items'
  onModeChange?: (mode: 'listas' | 'items') => void
  isTransparent?: boolean
}

export default function Navbar({ mode, onModeChange, isTransparent = false }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, profile, isLoading, signOut, openAuthModal } = useAuth()
  const { openCreateModal } = useModal()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const bgClass = isTransparent
    ? 'bg-transparent'
    : 'bg-bg-primary/95 backdrop-blur-md border-b border-border'

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut()
  }

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/">
            <h1
              id="logo"
              className="font-serif text-xl font-bold italic text-text-primary tracking-wide cursor-pointer"
            >
              Opinext
            </h1>
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm">
            <Link
              href="/"
              className="text-text-primary/80 hover:text-text-primary transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/lists"
              className="text-text-primary/80 hover:text-text-primary transition-colors"
            >
              Explorar
            </Link>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-text-dark text-bg-primary font-bold text-[10px] tracking-widest uppercase hover:bg-text-dark/90 transition-all shadow-sm"
            >
              Shop
            </Link>
            <Link
              href="/journal"
              className="text-text-primary/80 hover:text-text-primary transition-colors"
            >
              Journal
            </Link>
          </div>
        </div>

        {/* Center: Mode selector */}
        <div className="hidden sm:flex">
          {mode && onModeChange && <ModeSelector mode={mode} onChange={onModeChange} />}
        </div>

        {/* Right: Search, Create, User */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 border border-border">
                <Search size={16} className="text-text-primary/60" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Buscar..."
                  autoFocus
                  className="bg-transparent text-text-primary text-sm ml-2 w-40 outline-none placeholder:text-text-primary/40"
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                id="search-toggle"
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Search size={18} className="text-text-primary/70" />
              </button>
            )}
          </div>

          {/* Create button */}
          <button
            id="create-button"
            onClick={() => user ? openCreateModal() : openAuthModal()}
            className="px-4 py-1.5 bg-bg-secondary text-text-primary text-sm font-semibold rounded-md hover:bg-bg-secondary/80 transition-colors tracking-wide"
          >
            CREATE
          </button>

          {/* User section */}
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : user && profile ? (
            /* Logged in: avatar + dropdown */
            <div ref={menuRef} className="relative">
              <button
                id="user-menu-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-text-secondary/30 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-text-primary">
                      {profile.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-text-primary/50 transition-transform hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-bg-secondary/95 backdrop-blur-xl border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-text-primary text-sm font-medium truncate">
                      {profile.display_name || profile.username}
                    </p>
                    <p className="text-text-primary/50 text-xs truncate">
                      @{profile.username}
                    </p>
                    {profile.role === 'admin' && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium">
                        <Shield size={10} />
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href={`/${profile.username}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary/70 hover:bg-white/5 hover:text-text-primary transition-colors"
                    >
                      <User size={16} />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary/70 hover:bg-white/5 hover:text-text-primary transition-colors"
                    >
                      <Settings size={16} />
                      Configuración
                    </Link>
                    {profile.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-400/70 hover:bg-white/5 hover:text-amber-400 transition-colors"
                      >
                        <Shield size={16} />
                        Panel Admin
                      </Link>
                    )}
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-border py-1">
                    <button
                      id="sign-out-button"
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400/70 hover:bg-white/5 hover:text-red-400 transition-colors"
                    >
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: Login button */
            <button
              onClick={openAuthModal}
              id="login-button"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border hover:bg-white/10 transition-colors text-sm text-text-primary/80 hover:text-text-primary"
            >
              <User size={16} />
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile mode selector */}
      <div className="sm:hidden flex justify-center pb-2">
        {mode && onModeChange && <ModeSelector mode={mode} onChange={onModeChange} />}
      </div>
    </nav>
  )
}
