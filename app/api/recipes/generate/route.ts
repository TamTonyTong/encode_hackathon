import { NextRequest, NextResponse } from 'next/server';
import { RecipeGenerateRequest, RecipeGenerateResponse } from '@/app/types/api';
import { suggestRecipes } from '@/app/lib/agentTools';

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerateRequest = await request.json();

    // Build a query from the request. If ingredients are provided, join them.
    // This endpoint is typically called programmatically, not by chat.
    const queryParts: string[] = [];
    if (body.ingredients && body.ingredients.length > 0) {
      queryParts.push(`Using ingredients: ${body.ingredients.join(', ')}`);
    }
    if (body.preferences?.cuisine) {
      queryParts.push(`cuisine: ${body.preferences.cuisine}`);
    }
    const query = queryParts.length > 0 ? queryParts.join('. ') : 'random recipe';

    // Use the intelligent recipe agent
    const result = await suggestRecipes({
      query,
      ingredients: body.ingredients,
      language: body.language || 'en'
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to generate recipes');
    }

    const data = result.data as any;

    const primaryRecipe = data.recipe;
    const recipes = [primaryRecipe];

    const response: RecipeGenerateResponse = {
      recipes: recipes,
      totalCount: recipes.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Recipe generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
