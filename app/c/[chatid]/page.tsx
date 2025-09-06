'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';
import { Sidebar, useSidebar } from '../../sidebar';
import { useToast } from '../../components/messaging/ToastProvider';
import { chatService } from '../../lib/chatService';
import { gsap } from 'gsap';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export default function ChatPage() {
  const { chatid } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { initialMessage, setInitialMessage } = useChatContext();
  const { isExpanded, toggleSidebar } = useSidebar();
  const { showError, showSuccess } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasSentInitialMessage, setHasSentInitialMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorShownRef = useRef(false); // Ref to track if error was already shown

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Check authentication and fetch chat data
  useEffect(() => {
    const initializeChat = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Verify chat exists and belongs to user
        const chatData = await chatService.getChat(chatid as string, user.id);
        console.log('Chat data:', chatData);
        
        // Fetch existing messages for this chat
        const chatMessages = await chatService.getMessages(chatid as string);
        setMessages(chatMessages);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsInitialLoad(false);
        
        // Only show error once and redirect to 404
        if (!errorShownRef.current) {
          errorShownRef.current = true;
          router.push('/404');
        }
      }
    };

    if (chatid && user) {
      initializeChat();
    }
  }, [user, authLoading, chatid, router, showError]);

  // Send initial message if available
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (
        !isInitialLoad && 
        initialMessage && 
        !hasSentInitialMessage && 
        messages.length === 0
      ) {
        try {
          setIsLoading(true);
          setHasSentInitialMessage(true);
          
          // Add user message to UI immediately
          const userMessage: Message = {
            id: `temp-${Date.now()}`,
            content: initialMessage,
            role: 'user',
            created_at: new Date().toISOString(),
          };

          setMessages(prev => [...prev, userMessage]);

          // Add user message to database
          const savedUserMessage = await chatService.addMessage(
            chatid as string,
            initialMessage,
            'user'
          );

          // Replace temporary message with saved message
          setMessages(prev => 
            prev.map(msg => 
              msg.id === userMessage.id ? { ...savedUserMessage, created_at: savedUserMessage.created_at } : msg
            )
          );

          // Clear the initial message from context
          setInitialMessage(null);

          // TODO: Send message to AI service and get response
          // This is a placeholder for the actual AI API call
          setTimeout(async () => {
            const aiMessageContent = `This is a placeholder response to: "${initialMessage}"`;
            
            // Add AI message to database
            const savedAiMessage = await chatService.addMessage(
              chatid as string,
              aiMessageContent,
              'assistant'
            );

            // Add AI message to UI
            setMessages(prev => [...prev, { ...savedAiMessage, created_at: savedAiMessage.created_at }]);
            
            // Update chat message count
            await chatService.updateChatMessageCount(chatid as string, 2); // 1 user + 1 AI
            
            setIsLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Error sending initial message:', error);
          showError('Failed to send initial message');
          setIsLoading(false);
          setHasSentInitialMessage(true);
        }
      }
    };

    sendInitialMessage();
  }, [isInitialLoad, initialMessage, hasSentInitialMessage, messages.length, chatid, setInitialMessage, showError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    try {
      setIsLoading(true);
      
      // Add user message to UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: inputValue.trim(),
        role: 'user',
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      const userMessageContent = inputValue.trim();
      setInputValue('');

      // Add user message to database
      const savedUserMessage = await chatService.addMessage(
        chatid as string,
        userMessageContent,
        'user'
      );

      // Replace temporary message with saved message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...savedUserMessage, created_at: savedUserMessage.created_at } : msg
        )
      );

      // TODO: Send message to AI service and get response
      // This is a placeholder for the actual AI API call
      setTimeout(async () => {
        const aiMessageContent = `This is a placeholder response to: "${userMessageContent}"`;
        
        // Add AI message to database
        const savedAiMessage = await chatService.addMessage(
          chatid as string,
          aiMessageContent,
          'assistant'
        );

        // Add AI message to UI
        setMessages(prev => [...prev, { ...savedAiMessage, created_at: savedAiMessage.created_at }]);
        
        // Update chat message count
        await chatService.updateChatMessageCount(chatid as string, messages.length + 2);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state while checking authentication
  if (authLoading || isInitialLoad) {
    return (
      <div className="flex" style={{ background: 'var(--background)', height: '100vh' }}>
        <Sidebar isExpanded={isExpanded} onToggle={toggleSidebar} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-3">
            {/* Skeleton for messages */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--secondary)' }}
                  ></div>
                  <div 
                    className="flex-1 h-16 rounded-lg animate-pulse"
                    style={{ backgroundColor: 'var(--secondary)' }}
                  ></div>
                </div>
              ))}
            </div>
            
            {/* Skeleton for input */}
            <div 
              className="w-full h-32 rounded-2xl animate-pulse mt-8"
              style={{ backgroundColor: 'var(--secondary)' }}
            ></div>
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
      <div className="flex-1 flex flex-col" style={{ height: '100vh' }}>
        {/* Messages container - only this part scrolls */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-lg" style={{ color: 'var(--text)' }}>
                  Start a conversation by sending a message below.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'rounded-br-none' 
                        : 'rounded-bl-none'
                    }`}
                    style={{ 
                      background: message.role === 'user' 
                        ? 'var(--accent-main)' 
                        : 'var(--primary)',
                      border: '1px solid var(--border)',
                      color: message.role === 'user' 
                        ? 'white' 
                        : 'var(--text)'
                    }}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div 
                  className="max-w-[80%] rounded-2xl rounded-bl-none px-4 py-3"
                  style={{ 
                    background: 'var(--primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)'
                  }}
                >
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - matching the new chat page styling */}
        <div className="p-4">
          <div className="w-full max-w-2xl mx-auto space-y-3">
            {/* Main prompt input textbox */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
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
                  backgroundColor: inputValue.trim() && !isLoading 
                    ? 'var(--accent-main)' 
                    : 'var(--accent-disabled)',
                  border: 'none'
                }}
                disabled={!inputValue.trim() || isLoading}
                onClick={handleSendMessage}
                onMouseEnter={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-main)';
                  } else {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                  }
                }}
                onFocus={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-focus)';
                  } else {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                  }
                }}
                onBlur={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-main)';
                  } else {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-disabled)';
                  }
                }}
              >
                {isLoading ? (
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
    </div>
  );
}
