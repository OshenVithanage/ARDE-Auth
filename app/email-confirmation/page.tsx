import { Suspense } from 'react'
import EmailConfirmationForm from './EmailConfirmationForm'

export default function EmailConfirmation() {
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
                <Suspense fallback={<div>Loading...</div>}>
                    <EmailConfirmationForm />
                </Suspense>
            </div>
        </div>
    )
}
