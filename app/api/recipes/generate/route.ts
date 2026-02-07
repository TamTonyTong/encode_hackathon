import { NextRequest, NextResponse } from 'next/server';
import { RecipeGenerateRequest, RecipeGenerateResponse } from '@/app/types/api';
import { MOCK_RECIPES } from '@/app/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body: RecipeGenerateRequest = await request.json();
    
    // TODO: Replace with actual AI service call
    // Example:
    // const recipes = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{
    //     role: "user",
    //     content: `Generate Vietnamese recipes using: ${body.ingredients?.join(', ')}`
    //   }]
    // });
    
    // For now, return mock data filtered by preferences
    let filteredRecipes = [...MOCK_RECIPES];
    
    // Simple filtering example (expand when AI is integrated)
    if (body.preferences?.maxCalories) {
      filteredRecipes = filteredRecipes.filter(
        r => r.calories <= (body.preferences?.maxCalories || Infinity)
      );
    }
    
    const response: RecipeGenerateResponse = {
      recipes: filteredRecipes,
      totalCount: filteredRecipes.length
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
