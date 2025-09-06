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
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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

  // Copy message to clipboard
  const copyMessageToClipboard = async (content: string, messageId: string) => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      } else {
        await navigator.clipboard.writeText(content);
      }
      
      // Show tick animation
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000); // Show tick for 2 seconds
    } catch (error) {
      console.error('Failed to copy message:', error);
      showError('Failed to copy message');
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
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                  onMouseEnter={() => message.role === 'user' ? setHoveredMessageId(message.id) : null}
                  onMouseLeave={() => message.role === 'user' ? setHoveredMessageId(null) : null}
                >
                  {message.role === 'user' ? (
                    <div 
                      className="max-w-[80%] rounded-2xl px-4 py-3 rounded-br-none"
                      style={{ 
                        background: 'var(--accent-main)',
                        border: '1px solid var(--border)',
                        color: 'white'
                      }}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-[80%] py-3">
                      <p className="whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                        {message.content}
                      </p>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <button
                      onClick={() => copyMessageToClipboard(message.content, message.id)}
                      className={`mt-1 w-6 h-6 rounded flex items-center justify-center transition-all duration-300 ${
                        hoveredMessageId === message.id || copiedMessageId === message.id ? 'opacity-70 hover:opacity-100' : 'opacity-0'
                      }`}
                      style={{ 
                        background: 'var(--secondary)',
                        color: 'var(--text)'
                      }}
                      aria-label={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                    >
                      <div className="relative w-4 h-4">
                        {/* Copy Icon */}
                        <svg 
                          className={`absolute inset-0 transition-all duration-300 ${
                            copiedMessageId === message.id ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
                          }`}
                          width="16" 
                          height="16" 
                          viewBox="0 -0.5 25 25" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5H8.25005ZM9.00005 8.267H9.75006L9.75004 8.26283L9.00005 8.267ZM9.93892 5.96432L10.4722 6.49171L9.93892 5.96432ZM12.2311 5V4.24999L12.2269 4.25001L12.2311 5ZM16.269 5L16.2732 4.25H16.269V5ZM18.5612 5.96432L18.0279 6.49171V6.49171L18.5612 5.96432ZM19.5 8.267L18.75 8.26283V8.267H19.5ZM19.5 12.233H18.75L18.7501 12.2372L19.5 12.233ZM18.5612 14.5357L18.0279 14.0083L18.5612 14.5357ZM16.269 15.5V16.25L16.2732 16.25L16.269 15.5ZM16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5C15.25 15.9142 15.5858 16.25 16 16.25V14.75ZM9.00005 9.25C9.41426 9.25 9.75005 8.91421 9.75005 8.5C9.75005 8.08579 9.41426 7.75 9.00005 7.75V9.25ZM8.73105 8.5V7.74999L8.72691 7.75001L8.73105 8.5ZM6.43892 9.46432L6.97218 9.99171L6.43892 9.46432ZM5.50005 11.767H6.25006L6.25004 11.7628L5.50005 11.767ZM5.50005 15.734L6.25005 15.7379V15.734H5.50005ZM8.73105 19L8.72691 19.75H8.73105V19ZM12.769 19V19.75L12.7732 19.75L12.769 19ZM15.0612 18.0357L14.5279 17.5083L15.0612 18.0357ZM16 15.733H15.25L15.2501 15.7372L16 15.733ZM16.75 15.5C16.75 15.0858 16.4143 14.75 16 14.75C15.5858 14.75 15.25 15.0858 15.25 15.5H16.75ZM9.00005 7.75C8.58584 7.75 8.25005 8.08579 8.25005 8.5C8.25005 8.91421 8.58584 9.25 9.00005 9.25V7.75ZM12.7691 8.5L12.7732 7.75H12.7691V8.5ZM15.0612 9.46432L15.5944 8.93694V8.93694L15.0612 9.46432ZM16.0001 11.767L15.2501 11.7628V11.767H16.0001ZM15.2501 15.5C15.2501 15.9142 15.5858 16.25 16.0001 16.25C16.4143 16.25 16.7501 15.9142 16.7501 15.5H15.2501ZM9.75005 8.5V8.267H8.25005V8.5H9.75005ZM9.75004 8.26283C9.74636 7.60005 10.0061 6.96296 10.4722 6.49171L9.40566 5.43694C8.65985 6.19106 8.24417 7.21056 8.25006 8.27117L9.75004 8.26283ZM10.4722 6.49171C10.9382 6.02046 11.5724 5.75365 12.2352 5.74999L12.2269 4.25001C11.1663 4.25587 10.1515 4.68282 9.40566 5.43694L10.4722 6.49171ZM12.2311 5.75H16.269V4.25H12.2311V5.75ZM16.2649 5.74999C16.9277 5.75365 17.5619 6.02046 18.0279 6.49171L19.0944 5.43694C18.3486 4.68282 17.3338 4.25587 16.2732 4.25001L16.2649 5.74999ZM18.0279 6.49171C18.494 6.96296 18.7537 7.60005 18.7501 8.26283L20.25 8.27117C20.2559 7.21056 19.8402 6.19106 19.0944 5.43694L18.0279 6.49171ZM18.75 8.267V12.233H20.25V8.267H18.75ZM18.7501 12.2372C18.7537 12.8999 18.494 13.537 18.0279 14.0083L19.0944 15.0631C19.8402 14.3089 20.2559 13.2894 20.25 12.2288L18.7501 12.2372ZM18.0279 14.0083C17.5619 14.4795 16.9277 14.7463 16.2649 14.75L16.2732 16.25C17.3338 16.2441 18.3486 15.8172 19.0944 15.0631L18.0279 14.0083ZM16.269 14.75H16V16.25H16.269V14.75ZM9.00005 7.75H8.73105V9.25H9.00005V7.75ZM8.72691 7.75001C7.6663 7.75587 6.65146 8.18282 5.90566 8.93694L6.97218 9.99171C7.43824 9.52046 8.07241 9.25365 8.73519 9.24999L8.72691 7.75001ZM5.90566 8.93694C5.15985 9.69106 4.74417 10.7106 4.75006 11.7712L6.25004 11.7628C6.24636 11.1001 6.50612 10.463 6.97218 9.99171L5.90566 8.93694ZM4.75005 11.767V15.734H6.25005V11.767H4.75005ZM4.75006 15.7301C4.73847 17.9382 6.51879 19.7378 8.72691 19.75L8.7352 18.25C7.35533 18.2424 6.2428 17.1178 6.25004 15.7379L4.75006 15.7301ZM8.73105 19.75H12.769V18.25H8.73105V19.75ZM12.7732 19.75C13.8338 19.7441 14.8486 19.3172 15.5944 18.5631L14.5279 17.5083C14.0619 17.9795 13.4277 18.2463 12.7649 18.25L12.7732 19.75ZM15.5944 18.5631C16.3402 17.8089 16.7559 16.7894 16.75 15.7288L15.2501 15.7372C15.2537 16.3999 14.994 17.037 14.5279 17.5083L15.5944 18.5631ZM16.75 15.733V15.5H15.25V15.733H16.75ZM9.00005 9.25H12.7691V7.75H9.00005V9.25ZM12.7649 9.24999C13.4277 9.25365 14.0619 9.52046 14.5279 9.99171L15.5944 8.93694C14.8486 8.18282 13.8338 7.75587 12.7732 7.75001L12.7649 9.24999ZM14.5279 9.99171C14.994 10.463 15.2537 11.1001 15.2501 11.7628L16.75 11.7712C16.7559 10.7106 16.3402 9.69106 15.5944 8.93694L14.5279 9.99171ZM15.2501 11.767V15.5H16.7501V11.767H15.2501Z" 
                            fill="currentColor"
                          />
                        </svg>
                        
                        {/* Check/Tick Icon */}
                        <svg 
                          className={`absolute inset-0 transition-all duration-300 ${
                            copiedMessageId === message.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                          }`}
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M20 6L9 17L4 12" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                  )}
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
