'use client'

import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, redirect to accounts
        router.push('/accounts')
      } else {
        // User is not logged in, redirect to login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Show skeletal loading state while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Gradient background with content */}
        <div className="flex-1 relative bg-gradient-to-br from-[var(--accent-main)] via-[var(--accent-hover)] to-[var(--accent-dark)] flex flex-col justify-center items-start p-12 lg:p-20">
          {/* Logo */}
          <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5">
                <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="h-6 bg-white/50 rounded animate-pulse w-20"></div>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-lg">
            <div className="h-16 bg-white/30 rounded animate-pulse mb-4 w-4/5"></div>
            <div className="h-16 bg-white/20 rounded animate-pulse mb-4 w-3/4"></div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-main)]/20 to-transparent pointer-events-none" />
        </div>

        {/* Right side - Skeletal loading */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
          <div className="w-full max-w-md space-y-8">
            <div className="text-left text-2xl font-bold">
              <div className="h-8 bg-[var(--secondary)] rounded animate-pulse w-1/3"></div>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              <div>
                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse mb-2 w-1/4"></div>
                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
              </div>

              <div>
                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse mb-2 w-1/4"></div>
                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
              </div>

              <div className="h-12 bg-[var(--accent-main)] rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  return null
}
