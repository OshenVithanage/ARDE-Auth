'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import MessageGroup from './MessageGroup'
import { ToastMessageData } from './ToastMessage'

interface ToastContextType {
    showMessage: (message: Omit<ToastMessageData, 'id' | 'timestamp'>) => void
    showError: (message: string) => void
    showWarning: (message: string) => void
    showSuccess: (message: string) => void
    showInfo: (message: string) => void
    clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
    maxMessages?: number
}

export function ToastProvider({ children, maxMessages = 3 }: ToastProviderProps) {
    const [messages, setMessages] = useState<ToastMessageData[]>([])
    const [newestMessageId, setNewestMessageId] = useState<string | null>(null)

    const generateId = () => {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const showMessage = (messageData: Omit<ToastMessageData, 'id' | 'timestamp'>) => {
        const newMessage: ToastMessageData = {
            ...messageData,
            id: generateId(),
            timestamp: Date.now()
        }

        setNewestMessageId(newMessage.id)

        setMessages(prevMessages => {
            let updatedMessages = [...prevMessages, newMessage]
            
            // If we exceed maxMessages, clear all and show only the new one
            if (updatedMessages.length > maxMessages) {
                updatedMessages = [newMessage]
            }
            
            return updatedMessages
        })

        // Clear the newest message ID after animation completes
        setTimeout(() => {
            setNewestMessageId(null)
        }, 350)
    }

    const showError = (message: string) => {
        showMessage({ type: 'error', message })
    }

    const showWarning = (message: string) => {
        showMessage({ type: 'warning', message })
    }

    const showSuccess = (message: string) => {
        showMessage({ type: 'success', message })
    }

    const showInfo = (message: string) => {
        showMessage({ type: 'info', message })
    }

    const removeMessage = (id: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id))
    }

    const clearAll = () => {
        setMessages([])
    }

    const contextValue: ToastContextType = {
        showMessage,
        showError,
        showWarning,
        showSuccess,
        showInfo,
        clearAll
    }

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {messages.length > 0 && (
                <MessageGroup
                    messages={messages}
                    onClose={removeMessage}
                    onClearAll={clearAll}
                    newestMessageId={newestMessageId}
                />
            )}
        </ToastContext.Provider>
    )
}

export default ToastProvider
