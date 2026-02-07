import { RecipeGenerateRequest, RecipeGenerateResponse } from '../types/api';

export class RecipeService {
  private static baseUrl = '/api/recipes';

  static async generateRecipes(
    request: RecipeGenerateRequest
  ): Promise<RecipeGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
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
      console.error('Recipe service error:', error);
      throw error;
    }
  }
}
