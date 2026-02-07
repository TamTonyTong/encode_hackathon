export interface ChatMessage {
  message: string;
  language: 'en' | 'vi';
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
  recipe?: GeneratedRecipe;
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
