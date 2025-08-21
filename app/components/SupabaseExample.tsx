'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function SupabaseExample() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error signing in:', error.message)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error.message)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Supabase Authentication Example</h2>
      
      {user ? (
        <div>
          <p className="mb-4">Welcome, {user.email}!</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">You are not signed in.</p>
          <button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign In with GitHub
          </button>
        </div>
      )}
    </div>
  )
}
