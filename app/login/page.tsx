'use client'

import { useState } from 'react'

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [socialLoading, setSocialLoading] = useState<string | null>(null)

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        
        // Check if email or password is empty
        if (!email || !password) {
            alert('Please fill in all fields.')
            return
        }
        
        setLoading(true)
        
        // Simulate login process
        setTimeout(() => {
            console.log('Login attempt:', { email, password })  
            setLoading(false)
            // Clear form fields
            setEmail('')
            setPassword('')
            alert('Login functionality removed - UI only')
        }, 1000)
    }

    const handleSocialLogin = (provider: string) => {
        setSocialLoading(provider)
        
        // Simulate social login process
        setTimeout(() => {
            console.log(`${provider} login attempt`)
            setSocialLoading(null)
            alert(`${provider} login functionality removed - UI only`)
        }, 1000)
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
            <div className="flex-1 flex items-center justify-center p-8 bg-[var(--baground)]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left text-2xl font-bold">
                        <h2 className="text-3xl font-bold text-[var(--text)]">Sign in</h2>
                    </div>

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
                                            document.getElementById('sign-in-button')?.click();
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

                        {/* Password field */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-[var(--text)]">
                                    *Password
                                </label>
                                <a href="/forgot-password" className="text-sm hover:text-[var(--accent-main)] transition-colors cursor-pointer">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            document.getElementById('sign-in-button')?.click();
                                        }
                                    }}
                                    tabIndex={2}
                                    className="w-full px-4 py-2 bg-[var(--primary)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:border-transparent transition-all"
                                    placeholder="Password"
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

                        {/* Sign in button */}
                        <button
                            id="sign-in-button"
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-[var(--accent-main)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[var(--accent-main)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                        </button>

                        {/* OR divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border)]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[var(--baground)] text-gray-500">OR</span>
                            </div>
                        </div>

                        {/* Google sign in button */}
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading || socialLoading !== null}
                            className="w-full bg-[var(--primary)] border border-[var(--border)] text-[var(--text)] py-2 px-4 rounded-lg font-medium hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {socialLoading === 'google' ? (
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-6 h-6 text-black dark:text-white" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M915.2 448l-4.2-17.8H524V594h231.2c-24 114-135.4 174-226.4 174-66.2 0-136-27.8-182.2-72.6-47.4-46-77.6-113.8-77.6-183.6 0-69 31-138 76.2-183.4 45-45.2 113.2-70.8 181-70.8 77.6 0 133.2 41.2 154 60l116.4-115.8c-34.2-30-128-105.6-274.2-105.6-112.8 0-221 43.2-300 122C144.4 295.8 104 408 104 512s38.2 210.8 113.8 289c80.8 83.4 195.2 127 313 127 107.2 0 208.8-42 281.2-118.2 71.2-75 108-178.8 108-287.6 0-45.8-4.6-73-4.8-74.2z" fill="currentColor"/>
                                </svg>
                            )}
                            <span>Continue with Google</span>
                        </button>

                        {/* Apple sign in button */}
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading || socialLoading !== null}
                            className="w-full bg-[var(--primary)] border border-[var(--border)] text-[var(--text)] py-2 px-4 rounded-lg font-medium hover:bg-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {socialLoading === 'apple' ? (
                                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-6 h-6 text-black dark:text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
                                </svg>
                            )}
                            <span>Continue with Apple</span>
                        </button>
                    </form>

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