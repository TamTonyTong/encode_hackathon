import { NextRequest, NextResponse } from 'next/server';
import { runAgent, AgentResponse } from '@/app/lib/aiAgent';
import { ToolCallResult } from '@/app/lib/agentTools';
import { GeneratedRecipe } from '@/app/services/chatService';

interface ChatRequest {
  message: string;
  image?: string;
  language: 'en' | 'vi';
  conversationHistory?: { role: 'user' | 'assistant'; content: string; image?: string }[];
}

interface ChatResponse {
  reply: string;
  toolCalls?: ToolCallResult[];
  recipe?: GeneratedRecipe;
  ingredients?: string[];
  groceryDeals?: AgentResponse['groceryDeals'];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, image, language, conversationHistory } = body;

    // Run the AI agent with tools
    const agentResult = await runAgent({
      message,
      image,
      language,
      conversationHistory
    });

    const response: ChatResponse = {
      reply: agentResult.reply,
      toolCalls: agentResult.toolCalls.length > 0 ? agentResult.toolCalls : undefined,
      recipe: agentResult.recipe,
      ingredients: agentResult.ingredients,
      groceryDeals: agentResult.groceryDeals
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
