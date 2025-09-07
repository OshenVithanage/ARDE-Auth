# Environment Variables

This file documents the required environment variables for the application.
Actual environment variables should be set in a `.env.local` file (which is git-ignored) 
or in your deployment environment.

## Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

## Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

## System Prompt for AI
SYSTEM_PROMPT=You are a helpful AI assistant integrated into a chat application. Provide concise, accurate, and helpful responses to user queries.

## Chat Name Generation System Prompt (for Gemini 2.5 Flash-Lite)
CHAT_NAME_SYSTEM_PROMPT=You are a chat naming assistant. Based on the user's first message, generate a concise, descriptive title for the chat conversation. The title should be 3-6 words maximum, capture the main topic or intent, and be suitable as a chat name. Do not include quotation marks, prefixes like "Chat about", or explanatory text. Just return the clean title.
