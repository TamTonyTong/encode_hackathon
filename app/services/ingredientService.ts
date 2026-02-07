import { IngredientAnalyzeRequest, IngredientAnalyzeResponse } from '../types/api';

export class IngredientService {
  private static baseUrl = '/api/ingredients';

  static async analyzeIngredients(
    request: IngredientAnalyzeRequest
  ): Promise<IngredientAnalyzeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
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
      console.error('Ingredient service error:', error);
      throw error;
    }
  }
}
