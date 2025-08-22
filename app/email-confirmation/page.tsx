'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '../lib/supabase'
import { useToast } from '../components/messaging'

export default function EmailConfirmation() {
    const [email, setEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [resending, setResending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const searchParams = useSearchParams()
    const router = useRouter()
    const { showError, showSuccess } = useToast()
    const supabase = createClientComponentClient()
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Get email from URL params or localStorage
        const emailParam = searchParams.get('email')
        const storedEmail = localStorage.getItem('signup_email')
        
        if (emailParam) {
            setEmail(emailParam)
            localStorage.setItem('signup_email', emailParam)
        } else if (storedEmail) {
            setEmail(storedEmail)
        }
    }, [searchParams])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleResendEmail = async () => {
        if (!email) {
            showError('Email address not found. Please try signing up again.')
            return
        }

        setResending(true)
        
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            })

            if (error) {
                showError(`Failed to resend email: ${error.message}`)
            } else {
                showSuccess('Confirmation email sent successfully!')
                setCountdown(60) // 60 second cooldown
            }
        } catch (error) {
            console.error('Resend error:', error)
            showError('An unexpected error occurred. Please try again.')
        } finally {
            setResending(false)
        }
    }

    const handleVerifyOtp = async () => {
        // Trim the input and validate it only contains digits
        const trimmedOtp = otpCode.trim();
        if (!trimmedOtp || trimmedOtp.length < 6) {
            showError('Please enter a valid 6-digit verification code.')
            return
        }
        
        // Validate that the OTP only contains digits
        if (!/^\d{6}$/.test(trimmedOtp)) {
            showError('Please enter a valid 6-digit verification code containing only numbers.')
            return
        }

        setVerifying(true)

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: trimmedOtp,
                type: 'signup'
            })

            if (error) {
                showError(`Verification failed: ${error.message}`)
            } else if (data.user) {
                showSuccess('Email verified successfully! You can now sign in.')
                localStorage.removeItem('signup_email')
                router.push('/login')
            }
        } catch (error) {
            console.error('OTP verification error:', error)
            showError('An unexpected error occurred. Please try again.')
        } finally {
            setVerifying(false)
        }
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

            {/* Right side - Email confirmation content */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="space-y-4">
                        {/* Email icon */}
                        <div className="mx-auto w-16 h-16 bg-[var(--accent-main)] rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold text-[var(--text)]">Check your email</h2>
                        
                        <p className="text-gray-600">
                            We've sent a confirmation email to{' '}
                            <span className="font-medium text-[var(--text)]">{email}</span>
                        </p>

                        <p className="text-sm text-gray-500">
                            You can either click the link in your email or enter the verification code below.
                        </p>
                    </div>

                    {/* OTP Input Section */}
                    <div className="space-y-3.5">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-[var(--text)] mb-2 text-left">
                                *Verification Code
                            </label>
                            <div className="flex justify-center space-x-3">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            otpRefs.current[index] = el;
                                        }}
                                        type="text"
                                        maxLength={1}
                                        value={otpCode[index] || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            const newOtp = otpCode.split('');
                                            newOtp[index] = value;
                                            const newOtpString = newOtp.join('');
                                            setOtpCode(newOtpString);
                                            
                                            // Auto-focus next input if value was entered
                                            if (value && index < 5 && otpRefs.current[index + 1]) {
                                                otpRefs.current[index + 1]?.focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace') {
                                                if (otpCode[index]) {
                                                    // If current input has value, clear it
                                                    const newOtp = otpCode.split('');
                                                    newOtp[index] = '';
                                                    setOtpCode(newOtp.join(''));
                                                } else if (index > 0) {
                                                    // If current input is empty, move to previous and clear it
                                                    const newOtp = otpCode.split('');
                                                    newOtp[index - 1] = '';
                                                    setOtpCode(newOtp.join(''));
                                                    if (otpRefs.current[index - 1]) {
                                                        otpRefs.current[index - 1]?.focus();
                                                    }
                                                }
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                            if (pastedData.length === 6) {
                                                setOtpCode(pastedData);
                                                // Focus last input
                                                if (otpRefs.current[5]) {
                                                    otpRefs.current[5]?.focus();
                                                }
                                            }
                                        }}
                                        className="w-16 h-12 text-center text-lg font-mono bg-[var(--primary)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:border-transparent transition-all"
                                        placeholder="•"
                                        disabled={verifying}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Verify Code button */}
                        <button
                            id="verify-code-button"
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifying || otpCode.length < 6}
                            className="w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {verifying ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                            <span>{verifying ? 'Verifying...' : 'Verify Code'}</span>
                        </button>

                        {/* OR divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border)]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[var(--background)] text-gray-500">Didn't receive the email?</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleResendEmail}
                            disabled={resending || countdown > 0}
                            className="w-full bg-[var(--primary)] border border-[var(--border)] text-[var(--text)] py-2 px-4 rounded-lg font-medium hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                        >
                            {resending ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : null}
                            <span>
                                {countdown > 0 
                                    ? `Resend in ${countdown}s` 
                                    : resending 
                                        ? 'Sending...' 
                                        : 'Resend confirmation email'
                                }
                            </span>
                        </button>

                        <div className="text-sm text-gray-500">
                            Check your spam folder or{' '}
                            <button
                                onClick={handleResendEmail}
                                disabled={resending || countdown > 0}
                                className="text-[var(--accent-main)] hover:underline disabled:opacity-50 cursor-pointer"
                            >
                                try a different email address
                            </button>
                        </div>
                    </div>

                    {/* Footer links */}
                    <div className="pt-4 border-t border-[var(--border)]">
                        <a 
                            href="/login" 
                            className="text-[var(--accent-main)] hover:underline transition-colors"
                        >
                            Back to sign in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
