'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import { gsap } from 'gsap';
import { Sidebar, useSidebar } from '../../sidebar';
import { chatService } from '../../lib/chatService';
import { useToast } from '../../components/messaging/ToastProvider';

export default function NewChatPage() {
  const { user, loading } = useAuth();
  const { setInitialMessage } = useChatContext();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isExpanded, toggleSidebar } = useSidebar();
  const { showError, showSuccess } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if user is not authenticated
        router.push('/login');
        return;
      }
      
      // Set display name from user metadata or email
      const name = user.user_metadata?.display_name || 
                   user.user_metadata?.full_name || 
                   user.user_metadata?.name || 
                   user.email?.split('@')[0] || 
                   'User';
      setDisplayName(name);
    }
  }, [user, loading, router]);

  // GSAP animation handlers for textarea
  const handleMouseEnter = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Check if content is scrollable (has overflow)
      const hasScrollableContent = textarea.scrollHeight > textarea.clientHeight;
      
      if (hasScrollableContent) {
        // Calculate new height (100% increase - double the size)
        const currentHeight = textarea.clientHeight;
        const newHeight = currentHeight * 2;
        
        gsap.to(textarea, {
          height: newHeight,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Always return to original height (128px = h-32)
      gsap.to(textarea, {
        height: 128, // Original height in pixels
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  // Handle textarea change
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  // Handle send button click
  const handleSendClick = async () => {
    // Trim whitespace to check if prompt is actually empty
    if (!prompt.trim() || isCreatingChat) {
      return; // Don't send empty prompts or if already creating
    }

    try {
      setIsCreatingChat(true);
      
      // Store the initial message in context
      setInitialMessage(prompt.trim());
      
      // Create new chat in database
      const chatData = await chatService.createChat(user!.id);
      
      // Show success message
      showSuccess('Chat created successfully!');
      
      // Redirect to the new chat page
      router.push(`/c/${chatData.chat_id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      showError('Failed to create chat. Please try again.');
      setIsCreatingChat(false);
    }
  };

  // Handle Enter key press (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex" style={{ background: 'var(--background)', height: '100vh' }}>
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-3">
            {/* Skeleton for display name text */}
            <div className="text-center mb-4">
              <div 
                className="h-10 w-64 mx-auto rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--secondary)' }}
              ></div>
            </div>

            {/* Skeleton for main prompt input textbox */}
            <div className="relative">
              <div 
                className="w-full h-32 rounded-2xl animate-pulse"
                style={{ backgroundColor: 'var(--secondary)' }}
              ></div>
            </div>

            {/* Skeleton for second box */}
            <div 
              className="w-full h-13 rounded-2xl flex items-center justify-between px-3 animate-pulse"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              {/* Skeleton for plus button */}
              <div 
                className="w-9 h-9 rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--background)' }}
              ></div>

              {/* Skeleton for send button */}
              <div 
                className="w-9 h-9 rounded-lg animate-pulse"
                style={{ backgroundColor: 'var(--background)' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex" style={{ background: 'var(--background)', height: '100vh' }}>
      <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-3">
          {/* Display name text */}
          <div className="text-center mb-4">
            <h2 className="text-4xl font-medium" style={{ color: 'var(--text)' }}>
              Howdy, {displayName}!
            </h2>
          </div>

          {/* Main prompt input textbox */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter Your prompt here."
              className="w-full h-32 px-6 py-4 text-base rounded-2xl resize-none focus:outline-none custom-scrollbar"
              style={{ 
                background: 'var(--primary)',
                border: '1px solid var(--border)',
                color: 'var(--text)'
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </div>

          {/* Second box */}
          <div 
            className="w-full h-13 rounded-2xl flex items-center justify-between px-3"
            style={{ 
              background: 'var(--primary)',
              border: '1px solid var(--border)'
            }}
          >
            {/* Plus button */}
            <button
              className="w-9 h-9 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none cursor-pointer flex items-center justify-center"
              style={{ 
                border: '1px solid var(--border)',
                backgroundColor: 'transparent'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Square accent colored button */}
            <button
              className="w-9 h-9 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none cursor-pointer flex items-center justify-center"
              style={{ 
                backgroundColor: prompt.trim() ? 'var(--accent-main)' : 'var(--accent-disabled)',
                border: 'none'
              }}
              disabled={!prompt.trim() || isCreatingChat}
              onClick={handleSendClick}
              onMouseEnter={(e) => {
                if (prompt.trim()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (prompt.trim()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-main)';
                } else {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                }
              }}
              onFocus={(e) => {
                if (prompt.trim()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-focus)';
                } else {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                }
              }}
              onBlur={(e) => {
                if (prompt.trim()) {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-main)';
                } else {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                }
              }}
            >
              {isCreatingChat ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <path d="M14.4376 15.3703L12.3042 19.5292C11.9326 20.2537 10.8971 20.254 10.525 19.5297L4.24059 7.2971C3.81571 6.47007 4.65077 5.56156 5.51061 5.91537L18.5216 11.2692C19.2984 11.5889 19.3588 12.6658 18.6227 13.0704L14.4376 15.3703ZM14.4376 15.3703L5.09594 6.90886" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
 