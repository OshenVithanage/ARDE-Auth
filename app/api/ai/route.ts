import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Get the model (using gemini-2.5-flash)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();

    // Validate input
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Add system prompt if available
    const systemPrompt = process.env.SYSTEM_PROMPT || "You are a helpful AI assistant.";

    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

    // Generate content using the model
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response: ' + (error as Error).message },
      { status: 500 }
    );
  }
}