'use client'

import { useState, useEffect } from 'react'
import { useToast } from '../components/messaging'
import { createClientComponentClient } from '../lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetComplete, setResetComplete] = useState(false)
    const { showError, showSuccess } = useToast()
    const supabase = createClientComponentClient()
    const searchParams = useSearchParams()
    const router = useRouter()

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
            <div className="space-y-8 text-center">
                <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">Password Reset Complete!</h2>
                    <p className="text-gray-600">
                        Your password has been successfully updated. You can now sign in with your new password.
                    </p>
                </div>
                
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        )
    }

    return (
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
                                document.getElementById('reset-password-button')?.click();
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
                                document.getElementById('reset-password-button')?.click();
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

            {/* Reset password button */}
            <button
                id="reset-password-button"
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : null}
                <span>{loading ? 'Updating password...' : 'Update Password'}</span>
            </button>
        </form>
    )
}