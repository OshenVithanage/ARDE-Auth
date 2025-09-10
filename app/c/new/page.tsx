'use client'

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import { gsap } from 'gsap';
import { Sidebar, useSidebar } from '../../sidebar';
import { chatService } from '../../lib/chatService';
import { useToast } from '../../components/messaging/ToastProvider';
import { createClientComponentClient } from '../../lib/supabase';

interface Chat {
  chat_id: string;
  created_at: string;
  number_of_messages: number;
  name?: string;
}

export default function NewChatPage() {
  const { user, loading } = useAuth();
  const { setInitialMessage } = useChatContext();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const secondBoxRef = useRef<HTMLDivElement>(null);
  const { isExpanded, toggleSidebar } = useSidebar();
  const { showError } = useToast();
  const [isStarFilled, setIsStarFilled] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{top: number, right: number} | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  // State for custom delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{id: string, name: string} | null>(null);
  const supabase = createClientComponentClient();

  // Handle star toggle
  const handleStarToggle = () => {
    setIsStarFilled(!isStarFilled);
  };

  // Handle three dots menu toggle
  const handleMenuToggle = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenuChatId === chatId) {
      setOpenMenuChatId(null);
      setMenuPosition(null);
    } else {
      setOpenMenuChatId(chatId);
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right
      });
    }
  };

  // Handle menu actions
  const handleSelectChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement select functionality
    console.log('Select chat:', chatId);
    setOpenMenuChatId(null);
  };

  const handleRenameChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement rename functionality
    console.log('Rename chat:', chatId);
    setOpenMenuChatId(null);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Close the menu immediately
    setOpenMenuChatId(null);
    setMenuPosition(null);
    
    // Find the chat being deleted
    const chatToDelete = chats.find(chat => chat.chat_id === chatId);
    if (!chatToDelete) {
      showError('Chat not found.');
      return;
    }
    
    // Set the chat to delete and show custom confirmation modal
    const chatName = chatToDelete.name || `Chat from ${new Date(chatToDelete.created_at).toLocaleDateString()}`;
    setChatToDelete({id: chatId, name: chatName});
    setShowDeleteModal(true);
  };
  
  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    
    const chatId = chatToDelete.id;
    
    // Close the modal
    setShowDeleteModal(false);
    
    // Set loading state for this specific chat
    setDeletingChatId(chatId);
    
    try {
      // Delete the chat from Supabase
      await chatService.deleteChat(chatId, user!.id);
      
      // Success message
      console.log('Chat deleted successfully');
      
      // Optimistically remove the chat from the UI as a fallback
      // in case the real-time subscription is slow or not working
      setChats(prevChats => prevChats.filter(chat => chat.chat_id !== chatId));
      
    } catch (error) {
      console.error('Error deleting chat:', error);
      showError('Failed to delete chat. Please try again.');
    } finally {
      // Clear loading state and reset delete state
      setDeletingChatId(null);
      setChatToDelete(null);
    }
  };
  
  const cancelDeleteChat = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuChatId(null);
      setMenuPosition(null);
    };

    if (openMenuChatId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuChatId]);

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
      
      // Fetch user chats
      fetchUserChats();
    }
  }, [user, loading, router]);

  // Set up real-time subscription for chat history
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Chats',
          filter: `Owner=eq.${user.id}`,
        },
        (payload) => {
          console.log('Real-time chat change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new chat to the list
            const newChat = payload.new as Chat;
            setChats(prev => [newChat, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing chat
            const updatedChat = payload.new as Chat;
            setChats(prev => 
              prev.map(chat => 
                chat.chat_id === updatedChat.chat_id ? updatedChat : chat
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted chat
            const deletedChat = payload.old as Chat;
            console.log('Deleting chat:', deletedChat.chat_id);
            setChats(prev => 
              prev.filter(chat => chat.chat_id !== deletedChat.chat_id)
            );
            // Clear loading state if this chat was being deleted
            setDeletingChatId(prevId => 
              prevId === deletedChat.chat_id ? null : prevId
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Fetch user chats
  const fetchUserChats = async () => {
    try {
      setIsLoadingChats(true);
      const chatData = await chatService.getUserChats(user!.id);
      setChats(chatData || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Don't show error to user for chat history, just show empty state
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

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

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    router.push(`/c/${chatId}`);
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

          {/* Second box with chat history */}
          <div 
            ref={secondBoxRef}
            className="w-full rounded-2xl overflow-hidden transition-all duration-300"
            style={{ 
              background: 'var(--primary)',
              border: '1px solid var(--border)',
              height: prompt.trim() || chats.length === 0 ? '60px' : '200px'
            }}
          >
            {/* Conditional rendering - only one group visible at a time */}
            {prompt.trim() || chats.length === 0 ? (
              // Button group - only visible when collapsed
              <div className="flex items-center justify-between p-3">
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

                {/* Send button */}
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
            ) : (
              // Chat history - only visible when expanded
              <div className="h-full flex flex-col relative">
                <div className="text-sm font-medium mb-4 px-4 mt-4 flex items-center justify-between" style={{ color: 'var(--text)' }}>
                  <span>Chat History</span>
                  <button
                    onClick={handleStarToggle}
                    className="p-1 rounded transition-colors hover:bg-opacity-10"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    {isStarFilled ? (
                      // Filled star
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="var(--text)" />
                      </svg>
                    ) : (
                      // Unfilled star
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="var(--text)" strokeWidth="1.5" fill="none" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 pb-4 custom-scrollbar">
                  {isLoadingChats ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className="h-8 rounded-lg animate-pulse"
                          style={{ backgroundColor: 'var(--secondary)' }}
                        ></div>
                      ))}
                    </div>
                  ) : chats.length === 0 ? (
                    <div className="text-sm py-4 text-center" style={{ color: 'var(--text)' }}>
                      No chat history yet
                    </div>
                  ) : (
                    <div className="space-y-0 -mx-5">
                      {chats.map((chat, index) => (
                        <div key={chat.chat_id} data-chat-id={chat.chat_id}>
                          {index === 0 && (
                            <div 
                              className="h-px mb-0" 
                              style={{ backgroundColor: 'var(--border)' }}
                            ></div>
                          )}
                          <div
                            onClick={() => handleChatSelect(chat.chat_id)}
                            className="px-8 py-3 cursor-pointer hover:bg-opacity-10 transition-colors truncate relative group"
                            style={{ 
                              color: 'var(--text)'
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--border)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                          >
                            <div className="truncate pr-8">
                              {chat.name || `Chat from ${new Date(chat.created_at).toLocaleDateString()}`}
                            </div>
                            {/* Three dots icon - visible on hover, when menu is open, or when deleting */}
                            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-opacity ${
                              openMenuChatId === chat.chat_id || deletingChatId === chat.chat_id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <button
                                onClick={(e) => handleMenuToggle(chat.chat_id, e)}
                                className="p-1 rounded transition-colors hover:bg-opacity-10"
                                style={{ 
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border)';
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                }}
                                disabled={deletingChatId === chat.chat_id}
                              >
                                {deletingChatId === chat.chat_id ? (
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--text)' }}></div>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="1.5" fill="var(--text)"/>
                                    <circle cx="12" cy="6" r="1.5" fill="var(--text)"/>
                                    <circle cx="12" cy="18" r="1.5" fill="var(--text)"/>
                                  </svg>
                                )}
                              </button>
                              
                              {/* Dropdown Menu */}
                              {typeof document !== 'undefined' && openMenuChatId === chat.chat_id && menuPosition && createPortal(
                                <div 
                                  className="fixed w-30 rounded-lg shadow-lg z-[9999]"
                                  style={{ 
                                    backgroundColor: 'var(--primary)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                                    top: `${menuPosition.top}px`,
                                    right: `${menuPosition.right}px`
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Select Option */}
                                  <button
                                    onClick={(e) => handleSelectChat(chat.chat_id, e)}
                                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-opacity-10 transition-colors rounded-t-lg"
                                    style={{ 
                                      color: 'var(--text)',
                                      backgroundColor: 'transparent',
                                      border: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M20 6L9 17l-5-5" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Select</span>
                                  </button>
                                  
                                  {/* Divider */}
                                  <div 
                                    className="h-px mx-0" 
                                    style={{ backgroundColor: 'var(--border)' }}
                                  ></div>
                                  
                                  {/* Rename Option */}
                                  <button
                                    onClick={(e) => handleRenameChat(chat.chat_id, e)}
                                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-opacity-10 transition-colors"
                                    style={{ 
                                      color: 'var(--text)',
                                      backgroundColor: 'transparent',
                                      border: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Rename</span>
                                  </button>
                                  
                                  {/* Delete Option */}
                                  <button
                                    onClick={(e) => handleDeleteChat(chat.chat_id, e)}
                                    className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-opacity-10 transition-colors rounded-b-lg"
                                    style={{ 
                                      color: '#ef4444', // Red color for delete
                                      backgroundColor: 'transparent',
                                      border: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <line x1="10" y1="11" x2="10" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      <line x1="14" y1="11" x2="14" y2="17" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>,
                                document.body
                              )}
                            </div>
                          </div>
                          <div 
                            className="h-px" 
                            style={{ backgroundColor: 'var(--border)' }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000]"
          style={{ zIndex: 10000 }}
          onClick={cancelDeleteChat}
        >
          <div 
            className="rounded-lg p-6 w-full max-w-md"
            style={{ 
              backgroundColor: 'var(--primary)',
              border: '1px solid var(--border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text)' }}>
              Confirm Delete
            </h3>
            <p className="mb-6" style={{ color: 'var(--text)' }}>
              Are you sure you want to delete "{chatToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)'
                }}
                onClick={cancelDeleteChat}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none'
                }}
                onClick={confirmDeleteChat}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ef4444';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 