'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  initialMessage: string | null;
  setInitialMessage: (message: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const value = {
    initialMessage,
    setInitialMessage,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}