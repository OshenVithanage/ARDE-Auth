import { createClientComponentClient } from './supabase';

const supabase = createClientComponentClient();

export const chatService = {
  // Create a new chat
  createChat: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Chats')
        .insert([
          {
            Owner: userId,
            number_of_messages: 0
          }
        ])
        .select('chat_id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Get chat by ID
  getChat: async (chatId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Chats')
        .select('*')
        .eq('chat_id', chatId)
        .eq('Owner', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }
  },

  // Get user chats
  getUserChats: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Chats')
        .select('chat_id, created_at, number_of_messages, name')
        .eq('Owner', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  // Get messages for a chat
  getMessages: async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('Messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        // If the error is due to the table not existing, return empty array
        if (error.message.includes('relation "Messages" does not exist') || 
            error.message.includes('does not exist')) {
          console.warn('Messages table not found, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Add a message to a chat
  addMessage: async (chatId: string, content: string, role: 'user' | 'assistant') => {
    try {
      const { data, error } = await supabase
        .from('Messages')
        .insert([
          {
            chat_id: chatId,
            content,
            role
          }
        ])
        .select()
        .single();

      if (error) {
        // If the error is due to the table not existing, return a mock message
        if (error.message.includes('relation "Messages" does not exist') || 
            error.message.includes('does not exist')) {
          console.warn('Messages table not found, returning mock message');
          return {
            id: Date.now(),
            chat_id: chatId,
            content,
            role,
            created_at: new Date().toISOString()
          };
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  // Update chat message count
  updateChatMessageCount: async (chatId: string, count: number) => {
    try {
      const { data, error } = await supabase
        .from('Chats')
        .update({ number_of_messages: count })
        .eq('chat_id', chatId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating chat message count:', error);
      throw error;
    }
  },

  // Update chat name
  updateChatName: async (chatId: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('Chats')
        .update({ name: name })
        .eq('chat_id', chatId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating chat name:', error);
      throw error;
    }
  },

  // Delete chat and related messages
  deleteChat: async (chatId: string, userId: string) => {
    try {
      // First, delete all messages associated with this chat
      const { error: messagesError } = await supabase
        .from('Messages')
        .delete()
        .eq('chat_id', chatId);

      // If there's an error deleting messages (other than table not existing), throw it
      if (messagesError && !messagesError.message.includes('relation "Messages" does not exist') && 
          !messagesError.message.includes('does not exist')) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }

      // Then delete the chat itself
      const { error: chatError } = await supabase
        .from('Chats')
        .delete()
        .eq('chat_id', chatId)
        .eq('Owner', userId);

      if (chatError) throw chatError;
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  },
};