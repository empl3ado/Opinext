'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'
import { X, Loader2 } from 'lucide-react'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuth()
  const supabase = createClient()

  const [view, setView] = useState<'login' | 'register'>('login')

  // Login State
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Register State
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regBirthDate, setRegBirthDate] = useState('')
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  const [isRegLoading, setIsRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  if (!isAuthModalOpen) return null

  const isAdult = (dateString: string) => {
    if (!dateString) return false
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age >= 18
  }

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  const handleGoogleRegister = async () => {
    setRegError(null)
    setShowTermsError(false)

    if (!regAcceptedTerms) {
      setRegError('Debes aceptar los términos y condiciones')
      setShowTermsError(true)
      return
    }

    if (!regBirthDate || !isAdult(regBirthDate)) {
      setRegError('Debes ser mayor de 18 años para crear una cuenta en Opinext.')
      return
    }

    // Guardamos la fecha de nacimiento en una cookie para que la ruta de callback la reciba
    document.cookie = `temp_birth_date=${regBirthDate}; path=/; max-age=3600;`
    await handleGoogleAuth()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoginLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      if (error.message.includes('Email not confirmed') || error.message.includes('Email not verified')) {
        setLoginError('Debes confirmar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu bandeja de entrada o la carpeta de spam.')
      } else {
        setLoginError(
          error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : error.message
        )
      }
      setIsLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError(null)
    setShowTermsError(false)

    if (!regAcceptedTerms) {
      setRegError('Debes aceptar los términos y condiciones')
      setShowTermsError(true)
      return
    }

    if (!regBirthDate || !isAdult(regBirthDate)) {
      setRegError('Debes ser mayor de 18 años para crear una cuenta en Opinext.')
      return
    }

    setIsRegLoading(true)

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', regUsername)
      .single()

    if (existingUser) {
      setRegError('Ese usuario ya está en uso')
      setIsRegLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          username: regUsername,
          birth_date: regBirthDate,
        },
      },
    })

    if (signUpError) {
      setRegError(signUpError.message)
      setIsRegLoading(false)
      return
    }

    setRegSuccess(true)
    setIsRegLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeAuthModal} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-bg-page rounded-2xl shadow-2xl overflow-hidden border border-border-dark/10 animate-in fade-in zoom-in duration-300">
        
        {/* Close button */}
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
        >
          <X size={20} className="text-text-dark/40 hover:text-text-dark" />
        </button>

        <div className="p-8 md:p-10">
          {view === 'login' ? (
            /* LOGIN VIEW */
            <div className="animate-in slide-in-from-left-4 duration-300">
              <h2 className="font-serif text-3xl text-text-dark mb-1">Iniciar sesión</h2>
              <p className="text-text-dark/60 text-sm mb-8">Bienvenido de vuelta a tu espacio editorial.</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Correo</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-xs text-text-dark/50 hover:text-text-dark transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {loginError && <p className="text-red-500 text-xs text-center">{loginError}</p>}

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full bg-bg-primary text-text-primary py-3.5 rounded-md font-medium text-sm tracking-wide hover:bg-bg-primary/90 transition-colors flex justify-center items-center gap-2"
                >
                  {isLoginLoading ? <Loader2 size={18} className="animate-spin" /> : 'INICIAR SESIÓN'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-text-dark/5" />
                <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">O continúa con</span>
                <div className="flex-1 h-px bg-text-dark/5" />
              </div>

              <button
                onClick={handleGoogleAuth}
                className="w-full bg-white border border-border-dark/10 text-text-dark py-3 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors flex justify-center items-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>

              <p className="mt-8 text-center text-xs text-text-dark/40">
                ¿Primera vez aquí?{' '}
                <button 
                  onClick={() => setView('register')}
                  className="text-text-dark font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Regístrate
                </button>
              </p>
            </div>
          ) : (
            /* REGISTER VIEW */
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h2 className="font-serif text-3xl text-text-dark mb-1">Únete a Opinext</h2>
              <p className="text-text-dark/60 text-sm mb-8">Crea tu cuenta para comenzar.</p>

              {regSuccess ? (
                <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-6 text-center">
                  <p className="text-green-700 text-sm mb-4">¡Cuenta creada con éxito!</p>
                  <button 
                    onClick={() => setView('login')}
                    className="text-text-dark font-semibold text-sm underline underline-offset-4"
                  >
                    Ir al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Usuario</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={e => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="tu_usuario"
                      required
                      className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Correo</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      required
                      className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Contraseña</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-text-dark/40 uppercase mb-1">Nacimiento</label>
                      <input
                        type="date"
                        value={regBirthDate}
                        onChange={e => setRegBirthDate(e.target.value)}
                        required
                        className="w-full bg-transparent border-b border-text-dark/10 py-2 text-text-dark placeholder:text-text-dark/20 outline-none focus:border-text-dark transition-colors text-xs [color-scheme:light]"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms-modal"
                      checked={regAcceptedTerms}
                      onChange={e => setRegAcceptedTerms(e.target.checked)}
                      className={`mt-1 w-3.5 h-3.5 rounded border-text-dark/20 text-bg-primary focus:ring-bg-primary ${showTermsError && !regAcceptedTerms ? 'outline outline-2 outline-red-500' : ''}`}
                    />
                    <label htmlFor="terms-modal" className="text-[11px] text-text-dark/50 leading-tight">
                      Acepto los <a href="/legal" target="_blank" className="font-semibold text-text-dark/70 hover:underline">términos</a> y la <a href="/legal" target="_blank" className="font-semibold text-text-dark/70 hover:underline">política de privacidad</a> de Opinext.
                    </label>
                  </div>

                  {regError && <p className="text-red-500 text-[11px] text-center">{regError}</p>}

                  <button
                    type="submit"
                    disabled={isRegLoading}
                    className="w-full bg-bg-primary text-text-primary py-3 rounded-md font-medium text-sm tracking-wide hover:bg-bg-primary/90 transition-colors"
                  >
                    {isRegLoading ? <Loader2 size={18} className="animate-spin m-auto" /> : 'CREAR CUENTA'}
                  </button>

                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-text-dark/5" />
                    <span className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">O continúa con</span>
                    <div className="flex-1 h-px bg-text-dark/5" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="w-full bg-white border border-border-dark/10 text-text-dark py-3 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors flex justify-center items-center gap-3"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>

                  <p className="mt-6 text-center text-xs text-text-dark/40">
                    ¿Ya tienes cuenta?{' '}
                    <button 
                      onClick={() => setView('login')}
                      className="text-text-dark font-semibold hover:underline underline-offset-4 transition-all"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
