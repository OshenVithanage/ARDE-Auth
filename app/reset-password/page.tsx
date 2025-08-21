'use client'

import { useState, useEffect } from 'react'
import { useToast } from '../components/messaging'
import { createClientComponentClient } from '../lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetComplete, setResetComplete] = useState(false)
    const { showError, showSuccess } = useToast()
    const supabase = createClientComponentClient()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Check for hash fragment in URL (for OAuth callback)
    useEffect(() => {
        // Handle OAuth callback in the hash fragment
        const hash = window.location.hash.substring(1)
        if (hash) {
            const params = new URLSearchParams(hash)
            const accessToken = params.get('access_token')
            const refreshToken = params.get('refresh_token')
            
            if (accessToken && refreshToken) {
                // Set the session
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })
            }
        }
    }, [supabase])

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        
        // Check if passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match.')
            return
        }
        
        // Validate password strength
        if (password.length < 6) {
            showError('Password must be at least 6 characters long.')
            return
        }
        
        setLoading(true)
        
        try {
            // Update the user's password
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                showError(error.message)
                setLoading(false)
                return
            }

            showSuccess('Password updated successfully!')
            setResetComplete(true)
            
            // Clear form fields
            setPassword('')
            setConfirmPassword('')
        } catch (error) {
            console.error('Reset password error:', error)
            showError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (resetComplete) {
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

                {/* Right side - Reset complete */}
                <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                    <div className="w-full max-w-md space-y-8 text-center">
                        <div className="space-y-4">
                            {/* Success icon */}
                            <div className="mx-auto w-16 h-16 bg-[var(--accent-main)] rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold text-[var(--text)]">Password Reset</h2>
                            
                            <p className="text-gray-600">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                        </div>

                        <div className="pt-4">
                            <a 
                                href="/login" 
                                className="inline-block w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all"
                            >
                                Sign in
                            </a>
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

            {/* Right side - Reset Password form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left text-2xl font-bold">
                        <h2 className="text-3xl font-bold text-[var(--text)]">Reset Password</h2>
                        <p className="text-gray-600 mt-2">
                            Enter your new password below.
                        </p>
                    </div>

                    <form className="space-y-3.5" onSubmit={handleSubmit}>
                        {/* Password field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[var(--text)] mb-2">
                                *New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            document.getElementById('reset-button')?.click();
                                        }
                                    }}
                                    tabIndex={1}
                                    className="w-full px-4 py-2 bg-[var(--primary)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:border-transparent transition-all"
                                    placeholder="New Password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg 
                                            className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                            />
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                            />
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M3 3l18 18" 
                                            />
                                        </svg>
                                    ) : (
                                        <svg 
                                            className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                            />
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text)] mb-2">
                                *Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            document.getElementById('reset-button')?.click();
                                        }
                                    }}
                                    tabIndex={2}
                                    className="w-full px-4 py-2 bg-[var(--primary)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:border-transparent transition-all"
                                    placeholder="Confirm New Password"
                                    required
                                    disabled={loading}
                                />
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
                            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
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
                </div>
            </div>
        </div>
    )
}