'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Accounts() {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--accent-main)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-[var(--primary)] rounded-lg shadow-lg p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-[var(--text)]">Accounts</h1>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[var(--secondary)] rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">User Information</h2>
                            <div className="space-y-2">
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>User ID:</strong> {user.id}</p>
                                <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
                                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                                {user.user_metadata?.full_name && (
                                    <p><strong>Full Name:</strong> {user.user_metadata.full_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-[var(--secondary)] rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Authentication Status</h2>
                            <div className="space-y-2">
                                <p><strong>Status:</strong> <span className="text-green-500">Authenticated</span></p>
                                <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || user.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-[var(--secondary)] rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Welcome!</h2>
                            <p className="text-[var(--text)]">
                                You have successfully signed in with Supabase authentication using OTP email confirmation.
                                Your account is now secure and ready to use.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
