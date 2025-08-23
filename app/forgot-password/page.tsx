'use client'

import { useState, useEffect } from 'react'
import { useToast } from '../components/messaging'
import { createClientComponentClient } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const { showError, showSuccess } = useToast()
    const supabase = createClientComponentClient()
    const router = useRouter()

    useEffect(() => {
        // Simulate a brief loading delay for consistency
        const timer = setTimeout(() => {
            setPageLoading(false)
        }, 300)
        
        return () => clearTimeout(timer)
    }, [])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        
        // Check if email is empty
        if (!email) {
            showError('Please enter your email address.')
            return
        }
        
        setLoading(true)
        
        try {
            // Send password reset email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                showError(error.message)
                setLoading(false)
                return
            }

            showSuccess('Password reset instructions sent to your email!')
            setSent(true)
        } catch (error) {
            console.error('Forgot password error:', error)
            showError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (pageLoading) {
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
                            <div className="h-8 bg-[var(--secondary)] rounded animate-pulse w-2/3"></div>
                            <div className="h-4 bg-[var(--secondary)] rounded animate-pulse mt-2 w-4/5"></div>
                        </div>

                        {/* Form fields - Skeletal loading */}
                        <div className="space-y-3.5">
                            <div>
                                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse mb-2 w-1/4"></div>
                                <div className="h-12 bg-[var(--secondary)] rounded-lg animate-pulse"></div>
                            </div>

                            <div className="h-12 bg-[var(--accent-main)] rounded-lg animate-pulse"></div>
                        </div>

                        {/* Footer links */}
                        <div className="text-center space-y-2">
                            <div className="flex justify-center space-x-4 text-sm">
                                <div className="h-4 bg-[var(--secondary)] rounded animate-pulse w-1/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
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

            {/* Right side - Forgot Password form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left text-2xl font-bold">
                        <h2 className="text-3xl font-bold text-[var(--text)]">
                            {sent ? 'Check your email' : 'Forgot Password?'}
                        </h2>
                        {!sent && (
                            <p className="text-gray-600 mt-2">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        )}
                    </div>

                    {sent ? (
                        <div className="text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-[var(--accent-main)] rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            
                            <p className="text-gray-600">
                                We've sent a password reset link to{' '}
                                <span className="font-medium text-[var(--text)]">{email}</span>
                            </p>
                            
                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button 
                                    onClick={() => setSent(false)}
                                    className="text-[var(--accent-main)] hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                            
                            <div className="pt-4">
                                <a 
                                    href="/login" 
                                    className="text-[var(--accent-main)] hover:underline transition-colors"
                                >
                                    Back to sign in
                                </a>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-3.5" onSubmit={handleSubmit}>
                            {/* Email field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
                                    *Email
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                document.getElementById('reset-button')?.click();
                                            }
                                        }}
                                        tabIndex={1}
                                        className="w-full px-4 py-2 bg-[var(--primary)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:border-transparent transition-all"
                                        placeholder="Email"
                                        required
                                        disabled={loading}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Reset button */}
                            <button
                                id="reset-button"
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : null}
                                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                            </button>

                            {/* Footer links */}
                            <div className="text-center space-y-2">
                                <div className="flex justify-center space-x-4 text-sm">
                                    <a href="/login" className="text-gray-500 hover:text-[var(--accent-main)] transition-colors cursor-pointer">
                                        Back to sign in
                                    </a>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}