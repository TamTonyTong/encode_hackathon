import { NextRequest, NextResponse } from 'next/server';
import { RecipeGenerateRequest, RecipeGenerateResponse } from '@/app/types/api';
import { suggestRecipes, getRecipeDetails } from '@/app/lib/agentTools';

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerateRequest = await request.json();

    // Build a user query from the request parameters
    let userQuery = 'random recipe';

    if (body.ingredients && body.ingredients.length > 0) {
      userQuery = `recipe with ${body.ingredients.join(', ')}`;
    }
    if (body.preferences?.cuisine) {
      userQuery = `${body.preferences.cuisine} ${userQuery}`;
    }

    // Use the recipe worker agent to get suggestions
    const result = await suggestRecipes({
      userQuery,
      ingredients: body.ingredients,
      language: body.language || 'en'
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to generate recipes');
    }

    const data = result.data as any;
    const suggestions = data.suggestions || [];

    if (suggestions.length === 0) {
      throw new Error('No recipes found');
    }

    // Get full details for the first suggestion
    const detailsResult = await getRecipeDetails({
      recipeName: suggestions[0].title,
      language: body.language || 'en'
    });

    if (!detailsResult.success || !detailsResult.data) {
      throw new Error('Failed to get recipe details');
    }

    const primaryRecipe = (detailsResult.data as any).recipe;

    const response: RecipeGenerateResponse = {
      recipes: [primaryRecipe],
      totalCount: 1
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
