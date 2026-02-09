import { ToolCallResult } from '../lib/agentTools';

export interface ChatMessage {
  message: string;
  image?: string;
  language: 'en' | 'vi';
  conversationHistory?: { role: 'user' | 'assistant'; content: string; image?: string }[];
}

export interface RecipeIngredient {
  name: { en: string; vi: string };
  amount: string;
}

export interface GeneratedRecipe {
  id: string;
  title: { en: string; vi: string };
  time: { en: string; vi: string };
  calories: number;
  image: string;
  ingredients: RecipeIngredient[];
  steps: { en: string; vi: string }[];
}

export interface ChatResponse {
  reply: string;
  toolCalls?: ToolCallResult[];
  recipe?: GeneratedRecipe;
  ingredients?: string[];
  groceryDeals?: {
    items: unknown[];
    bestDeals: unknown[];
    totalSavings: string;
  };
}

export class ChatService {
  private static baseUrl = '/api/chat';

  static async sendMessage(request: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }
}
