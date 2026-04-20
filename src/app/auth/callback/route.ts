import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check for temp_birth_date cookie
      const cookieStore = await cookies()
      const birthDate = cookieStore.get('temp_birth_date')?.value

      if (birthDate && data?.session?.user?.id) {
        // Update profile with birth_date
        await supabase
          .from('profiles')
          .update({ birth_date: birthDate })
          .eq('id', data.session.user.id)
        
        // Delete the cookie after using it
        cookieStore.delete('temp_birth_date')
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}
