import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Get the API key from environment variables (server-side)
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey || '');

// Get the Gemini 2.5 Flash-Lite model for chat name generation
const flashLiteModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    const { firstMessage } = await request.json();

    if (!firstMessage) {
      return NextResponse.json(
        { error: 'First message is required' },
        { status: 400 }
      );
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
    
    return NextResponse.json({ chatName });
  } catch (error) {
    console.error('Error generating chat name:', error);
    // Return a fallback name instead of throwing an error
    return NextResponse.json({ chatName: 'New Chat' });
  }
}
