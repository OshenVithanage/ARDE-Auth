'use client'

import { useState, useEffect } from 'react'

export interface ToastMessageData {
    id: string
    type: 'error' | 'warning' | 'success' | 'info'
    message: string
    timestamp: number
}

interface ToastMessageProps {
    message: ToastMessageData
    onClose: (id: string) => void
    isGrouped?: boolean
    isNewest?: boolean
    isExiting?: boolean
}

export default function ToastMessage({ message, onClose, isGrouped = false, isNewest = false, isExiting: isExitingAll = false }: ToastMessageProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        // Entrance animation for the newest message
        if (isNewest) {
            setTimeout(() => setIsVisible(true), 10)
        } else {
            setIsVisible(true)
        }

        // Auto dismiss after 10 seconds
        const timer = setTimeout(() => {
            handleClose()
        }, 10000)
        return () => clearTimeout(timer)
    }, [isNewest])

    useEffect(() => {
        if (isExitingAll) {
            setIsExiting(true)
        }
    }, [isExitingAll])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => {
            onClose(message.id)
        }, 300)
    }

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'error':
                return {
                    bgColor: 'bg-[var(--primary)]',
                    borderColor: 'border-red-200 dark:border-red-800',
                    textColor: 'text-red-700 dark:text-red-300',
                    iconColor: 'text-red-500',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    )
                }
            case 'warning':
                return {
                    bgColor: 'bg-[var(--primary)]',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    textColor: 'text-yellow-700 dark:text-yellow-300',
                    iconColor: 'text-yellow-500',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    )
                }
            case 'success':
                return {
                    bgColor: 'bg-[var(--primary)]',
                    borderColor: 'border-green-200 dark:border-green-800',
                    textColor: 'text-green-700 dark:text-green-300',
                    iconColor: 'text-green-500',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )
                }
            default: // info
                return {
                    bgColor: 'bg-[var(--primary)]',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    textColor: 'text-blue-700 dark:text-blue-300',
                    iconColor: 'text-blue-500',
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                }
        }
    }

    const config = getTypeConfig(message.type)

    return (
        <div
            className={`
                relative overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-out
                ${config.bgColor} ${config.borderColor}
                ${isVisible && !isExiting 
                    ? 'opacity-100 transform translate-x-0 scale-100' 
                    : 'opacity-0 transform translate-x-full scale-95'
                }
            `}
        >
            <div className="px-4 py-3">
                <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                        {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${config.textColor}`}>
                            {message.message}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`flex-shrink-0 ${config.textColor} hover:opacity-75 transition-opacity`}
                        aria-label="Close notification"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}