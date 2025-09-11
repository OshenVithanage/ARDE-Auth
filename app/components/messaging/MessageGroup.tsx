'use client'

import { useState, useRef, useEffect } from 'react'
import ToastMessage, { ToastMessageData } from './ToastMessage'

interface MessageGroupProps {
    messages: ToastMessageData[]
    onClose: (id: string) => void
    onClearAll: () => void
    newestMessageId?: string | null
}

export default function MessageGroup({ messages, onClose, onClearAll }: MessageGroupProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isExitingAll, setIsExitingAll] = useState(false)
    const groupRef = useRef<HTMLDivElement>(null)
    const clearAllTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const messageCount = messages.length

    const handleClearAll = () => {
        // Clear any existing timer
        if (clearAllTimerRef.current) {
            clearTimeout(clearAllTimerRef.current)
            clearAllTimerRef.current = null
        }
        
        setIsExitingAll(true)
        clearAllTimerRef.current = setTimeout(() => {
            onClearAll()
            // Removed setIsExitingAll(false) - rely on remount to reset state
        }, 300) 
    }

    // Cleanup effect to clear timer on unmount
    useEffect(() => {
        return () => {
            if (clearAllTimerRef.current) {
                clearTimeout(clearAllTimerRef.current)
                clearAllTimerRef.current = null
            }
        }
    }, [])


    if (messageCount === 0) return null

    return (
        <div
            ref={groupRef}
            className="fixed top-4 right-4 z-50 max-w-sm w-full"
            style={{ zIndex: 9999 }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="relative">
                {/* Spacer to define the area and height of the component */}
                <div 
                    className="transition-all duration-300 ease-out"
                    style={{ 
                        height: isExpanded 
                            ? `${messageCount * 65 + (messageCount > 1 ? 20 : 0)}px` 
                            : `${60 + (messageCount - 1) * 12}px` 
                    }} 
                />

                {/* Messages */}
                {messages.map((message, index) => {
                    const reversedIndex = messages.length - 1 - index;
                    const isNewest = reversedIndex === 0;

                    // Collapsed state styles
                    const collapsedTop = reversedIndex * 12;
                    const collapsedScale = 1 - (reversedIndex * 0.05);
                    
                    // Expanded state styles
                    const expandedTop = index * 65;

                    // Compute zIndex in JS to avoid dynamic Tailwind classes
                    const zIndex = isNewest ? 20 : Math.max(1, 10 - reversedIndex);

                    return (
                        <div
                            key={message.id}
                            className="absolute top-0 left-0 w-full transition-all duration-300 ease-out"
                            style={{
                                zIndex,
                                transform: isExpanded 
                                    ? `translateY(${expandedTop}px)`
                                    : `translateY(${collapsedTop}px) scale(${collapsedScale})`,
                            }}
                        >
                            <ToastMessage 
                                message={message} 
                                onClose={onClose}
                                isGrouped={messageCount > 1}
                                isNewest={isNewest}
                                isExiting={isExitingAll}
                            />
                        </div>
                    )
                })}
                
                {/* Clear all button - only shows for multiple messages when expanded */}
                {messageCount > 1 && (
                    <div 
                        className={`
                            absolute bottom-0 right-0 transition-all duration-300 ease-out
                            ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                        `}
                    >
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}