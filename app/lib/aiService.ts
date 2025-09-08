import { GoogleGenerativeAI } from '@google/generative-ai';

// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey || '');

// Get the model (using gemini-2.5-flash as requested)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

// Get the Gemini 2.5 Flash-Lite model for chat name generation
const flashLiteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});

/**
 * Generate a response from the Gemini AI model
 * @param prompt The user's input prompt
 * @param history Optional conversation history
 * @returns The AI-generated response
 */
export const generateAIResponse = async (prompt: string, history: Array<{role: string, parts: string[]}> = []): Promise<string> => {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    // System prompt available via environment variable if needed
    
    // Format the conversation history for Gemini
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(part => ({ text: part }))
    }));
    
    // Start a chat session with the model
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });
    
    // Send the message and get the response
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response: ' + (error as Error).message);
  }
};

/**
 * Generate a response from the Gemini AI model with system prompt
 * @param prompt The user's input prompt
 * @returns The AI-generated response
 */
export const generateAIResponseWithSystemPrompt = async (prompt: string): Promise<string> => {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    // Add system prompt if available
    const systemPrompt = process.env.SYSTEM_PROMPT || "You are a helpful AI assistant.";
    
    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;
    
    // Generate content using the model
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response: ' + (error as Error).message);
  }
};

/**
 * Generate a chat name using Gemini 2.5 Flash-Lite based on the user's first message
 * @param firstMessage The user's first message in the chat
 * @returns A concise chat name
 */
export const generateChatName = async (firstMessage: string): Promise<string> => {
  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    
    // Get the chat name generation system prompt
    const chatNameSystemPrompt = process.env.CHAT_NAME_SYSTEM_PROMPT || 
      "Generate a concise, descriptive title for this chat based on the user's message. Keep it 3-6 words maximum.";
    
    // Combine system prompt with user's first message
    const fullPrompt = `${chatNameSystemPrompt}\n\nUser's first message: "${firstMessage}"`;
    
    // Generate chat name using the Flash-Lite model
    const result = await flashLiteModel.generateContent(fullPrompt);
    const response = await result.response;
    let chatName = response.text().trim();
    
    // Clean up the response - remove quotes if present and limit length
    chatName = chatName.replace(/['"]/g, '').trim();
    
    // Ensure the name isn't too long (max 50 characters)
    if (chatName.length > 50) {
      chatName = chatName.substring(0, 47) + '...';
    }
    
    // Fallback if the generated name is empty or too short
    if (!chatName || chatName.length < 3) {
      chatName = 'New Chat';
    }
    
    return chatName;
  } catch (error) {
    console.error('Error generating chat name:', error);
    // Return a fallback name instead of throwing an error
    return 'New Chat';
  }
};