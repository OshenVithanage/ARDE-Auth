'use client'

import { Suspense, useEffect } from 'react'
import LoginForm from './LoginForm'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Login() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // If user is already logged in, redirect to accounts
        if (!loading && user) {
            router.push('/accounts')
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
                                <svg width="100%" height="100%" viewBox="0 0 291 329" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M277.705 249.749L242.97 285.979C242.772 286.014 242.438 286.054 241.926 286.05C240.251 286.035 237.801 285.546 234.936 284.416C232.131 283.31 229.402 281.775 227.222 280.125C224.906 278.372 223.865 276.99 223.589 276.446C213.161 255.945 189.518 241.25 145.06 241.25C102.723 241.25 79.5594 254.579 69.1963 274.166C68.855 274.811 67.6682 276.327 65.1846 278.242C62.8439 280.047 59.9362 281.753 56.9609 283.019C53.9201 284.312 51.2981 284.937 49.4746 285.025C48.9048 285.053 48.5333 285.024 48.3135 284.994L12.5176 249.568L145.06 20L277.705 249.749Z" stroke="currentColor" strokeWidth="20"/>
                                    <circle cx="145" cy="164" r="25" fill="currentColor"/>
                                </svg>
                            </div>
                            <span className="text-white text-xl font-semibold">Garmen</span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="max-w-lg">
                        <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight mb-4">
                            <span className="text-white/80">*1.</span>
                            Your one way to save the pocket.
                        </h1>
                    </div>

                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-main)]/20 to-transparent pointer-events-none" />
                </div>

                {/* Right side - Skeletal loading */}
                <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-left text-2xl font-bold">
                            <h2 className="text-3xl font-bold text-[var(--text)]">Sign in</h2>
                        </div>

                        {/* Form fields - Skeletal loading */}
                        <div className="space-y-3.5">
                            <div>
                                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse mb-2 w-1/4"></div>
                                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="h-4 bg-[var(--secondary)] rounded animate-pulse w-1/4"></div>
                                    <div className="h-4 bg-[var(--secondary)] rounded animate-pulse w-1/5"></div>
                                </div>
                                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
                            </div>

                            <div className="h-12 bg-[var(--accent-main)] rounded-lg animate-pulse"></div>

                            {/* OR divider */}
                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--border)]" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <div className="px-2 bg-[var(--background)]">
                                        <div className="h-4 bg-[var(--secondary)] rounded animate-pulse w-8"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Social buttons */}
                            <div className="space-y-3">
                                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
                                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
                            </div>
                        </div>

                        {/* Footer links */}
                        <div className="text-center space-y-2">
                            <div className="flex justify-center space-x-4 text-sm">
                                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse w-1/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // If user is already logged in, don't render the login page
    if (user) {
        return null
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Gradient background with content */}
            <div className="flex-1 relative bg-gradient-to-br from-[var(--accent-main)] via-[var(--accent-hover)] to-[var(--accent-dark)] flex flex-col justify-center items-start p-12 lg:p-20">
                {/* Logo */}
                <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1.5">
                            <svg width="100%" height="100%" viewBox="0 0 291 329" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M277.705 249.749L242.97 285.979C242.772 286.014 242.438 286.054 241.926 286.05C240.251 286.035 237.801 285.546 234.936 284.416C232.131 283.31 229.402 281.775 227.222 280.125C224.906 278.372 223.865 276.99 223.589 276.446C213.161 255.945 189.518 241.25 145.06 241.25C102.723 241.25 79.5594 254.579 69.1963 274.166C68.855 274.811 67.6682 276.327 65.1846 278.242C62.8439 280.047 59.9362 281.753 56.9609 283.019C53.9201 284.312 51.2981 284.937 49.4746 285.025C48.9048 285.053 48.5333 285.024 48.3135 284.994L12.5176 249.568L145.06 20L277.705 249.749Z" stroke="currentColor" strokeWidth="20"/>
                                <circle cx="145" cy="164" r="25" fill="currentColor"/>
                            </svg>
                        </div>
                        <span className="text-white text-xl font-semibold">Garmen</span>
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-lg">
                    <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight mb-4">
                        <span className="text-white/80">*1.</span>
                        Your one way to save the pocket.
                    </h1>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-main)]/20 to-transparent pointer-events-none" />
            </div>

            {/* Right side - Login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left text-2xl font-bold">
                        <h2 className="text-3xl font-bold text-[var(--text)]">Sign in</h2>
                    </div>

                    <Suspense fallback={<div>Loading...</div>}>
                        <LoginForm />
                    </Suspense>

                    {/* Footer links */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center space-x-4 text-sm">
                            <a href="/signup" className="text-gray-500 hover:text-[var(--accent-main)] transition-colors cursor-pointer">
                                Don't have an account? Sign up
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}