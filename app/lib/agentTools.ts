import { MOCK_RECIPES, ALL_ITEMS, GroceryItem } from './mockData';
import { GeneratedRecipe } from '../services/chatService';

// =============================================================================
// Tool Types
// =============================================================================

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, {
        type: string;
        description: string;
        required?: boolean;
    }>;
}

export interface ToolCallResult {
    toolName: string;
    success: boolean;
    data: unknown;
    error?: string;
}

// =============================================================================
// Tool Definitions (Schema for future LLM integration)
// =============================================================================

export const AGENT_TOOLS: ToolDefinition[] = [
    {
        name: 'analyze_ingredients',
        description: 'Analyze an image or text to identify food ingredients.',
        parameters: {
            image: { type: 'string', description: 'Base64 encoded image data', required: false },
            text: { type: 'string', description: 'Text description of ingredients', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    },
    {
        name: 'suggest_recipes',
        description: 'An intelligent recipe agent that finds recipes based on user requests. Can search by dish name, ingredient, cuisine/area, or category.',
        parameters: {
            query: { type: 'string', description: 'The user query describing what they want to eat or cook', required: true },
            ingredients: { type: 'array', description: 'Optional list of available ingredients to consider', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    },
    {
        name: 'find_grocery_deals',
        description: 'Find the best prices and deals for groceries.',
        parameters: {
            items: { type: 'array', description: 'List of items to search for', required: true },
            maxDistanceKm: { type: 'number', description: 'Maximum distance in km', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    }
];

// =============================================================================
// TheMealDB API Helper
// =============================================================================

const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1';

interface MealDBSearchResult {
    meals: any[] | null;
}

async function searchByName(query: string): Promise<any[]> {
    const res = await fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`);
    const data: MealDBSearchResult = await res.json();
    return data.meals || [];
}

async function filterByIngredient(ingredient: string): Promise<any[]> {
    const res = await fetch(`${MEALDB_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data: MealDBSearchResult = await res.json();
    return data.meals || [];
}

async function filterByCategory(category: string): Promise<any[]> {
    const res = await fetch(`${MEALDB_BASE}/filter.php?c=${encodeURIComponent(category)}`);
    const data: MealDBSearchResult = await res.json();
    return data.meals || [];
}

async function filterByArea(area: string): Promise<any[]> {
    const res = await fetch(`${MEALDB_BASE}/filter.php?a=${encodeURIComponent(area)}`);
    const data: MealDBSearchResult = await res.json();
    return data.meals || [];
}

async function getRandomMeal(): Promise<any[]> {
    const res = await fetch(`${MEALDB_BASE}/random.php`);
    const data: MealDBSearchResult = await res.json();
    return data.meals || [];
}

async function getMealDetails(idMeal: string): Promise<any | null> {
    const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${idMeal}`);
    const data: MealDBSearchResult = await res.json();
    return data.meals?.[0] || null;
}

/**
 * Simple search fallback when no Gemini API key is available
 * Tries basic search strategies without AI
 */
async function simpleSearch(query: string, language: 'en' | 'vi'): Promise<ToolCallResult> {
    console.log(`[RecipeWorker] Simple search for: "${query}"`);

    // Try basic search strategies
    const searchStrategies = [
        { type: 'name', term: query },
        { type: 'name', term: query.split(' ')[0] }, // First word
        { type: 'ingredient', term: query.split(' ')[0] },
    ];

    let meals: any[] = [];
    let successfulStrategy: { type: string, term: string } | null = null;

    for (const strategy of searchStrategies) {
        try {
            if (strategy.type === 'name') {
                meals = await searchByName(strategy.term);
            } else if (strategy.type === 'ingredient') {
                meals = await filterByIngredient(strategy.term);
            }

            if (meals.length > 0) {
                successfulStrategy = strategy;
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (meals.length === 0) {
        // Last resort: random meal
        meals = await getRandomMeal();
        successfulStrategy = { type: 'random', term: 'random' };
    }

    if (meals.length > 0) {
        const topMeal = meals[0];
        let mealDetails = topMeal;
        if (!topMeal.strInstructions) {
            mealDetails = await getMealDetails(topMeal.idMeal);
        }

        if (mealDetails) {
            const recipe = mapMealToRecipe(mealDetails, language);
            return {
                toolName: 'suggest_recipes',
                success: true,
                data: { recipe, alternatives: [], searchStrategy: successfulStrategy?.type }
            };
        }
    }

    return {
        toolName: 'suggest_recipes',
        success: false,
        data: null,
        error: 'No recipes found'
    };
}

// =============================================================================
// Tool Implementations
// =============================================================================

/**
 * Analyze image/text to extract ingredients
 */
export async function analyzeIngredients(params: {
    image?: string;
    text?: string;
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        let ingredients: string[];

        if (params.text) {
            // Priority: Use the text provided (which comes from Gemini's vision analysis)
            ingredients = params.text.split(/[,，、;\n]+/).map(i => i.trim()).filter(Boolean);
        } else {
            // Fallback: If no text is provided, we cannot reliably detect ingredients without the model's help.
            // We return an empty list rather than hallucinating specific ingredients.
            ingredients = [];
        }

        return {
            toolName: 'analyze_ingredients',
            success: true,
            data: {
                ingredients,
                confidence: params.image ? 0.85 : 1.0,
                source: params.image ? 'image' : 'text'
            }
        };
    } catch (error) {
        return {
            toolName: 'analyze_ingredients',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to analyze ingredients'
        };
    }
}
/**
 * Recipe Worker Agent
 * A dedicated agent that autonomously tries different search strategies
 * until it finds relevant recipes. Uses try-and-error approach.
 */
export async function suggestRecipes(params: {
    userQuery: string;  // Original user query in any language
    ingredients?: string[];
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    const { userQuery, ingredients, language } = params;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(`[RecipeWorker] Starting search for: "${userQuery}"`);

    if (!apiKey) {
        console.warn('[RecipeWorker] No API key, using simple search');
        return await simpleSearch(userQuery, language);
    }

    try {
        // Import Gemini dynamically to avoid circular dependencies
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);

        // Recipe Worker Agent has its own specialized system instruction
        const workerInstruction = `You are a Recipe Search Worker. Your ONLY job is to find recipes from TheMealDB API.

TASK: Find recipes matching the user's request: "${userQuery}"

AVAILABLE SEARCH FUNCTIONS:
- search_by_name(term): Search by dish name (e.g., "chicken curry", "pasta")
- search_by_ingredient(ingredient): Filter by ingredient (e.g., "chicken", "beef")
- search_by_area(cuisine): Filter by cuisine (e.g., "Vietnamese", "Thai", "Italian", "Mexican")
- search_by_category(category): Filter by category (e.g., "Seafood", "Vegetarian", "Dessert")

RULES:
1. TheMealDB only supports ENGLISH search terms
2. Translate any non-English dish names to English
3. Try multiple search strategies until you find results
4. Start with the most specific search, then broaden if needed

Respond with a JSON object containing your search attempts:
{
  "attempts": [
    { "type": "name", "term": "english search term" },
    { "type": "ingredient", "term": "main ingredient" },
    { "type": "area", "term": "cuisine name" }
  ]
}

Generate 3-5 different search attempts, from most specific to most general.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        // Ask worker to generate search strategies
        const result = await model.generateContent(workerInstruction);
        const responseText = result.response.text();

        let searchAttempts: Array<{ type: string, term: string }> = [];
        try {
            const parsed = JSON.parse(responseText);
            searchAttempts = parsed.attempts || [];
            console.log('[RecipeWorker] Generated search attempts:', searchAttempts);
        } catch (e) {
            console.warn('[RecipeWorker] Failed to parse response, using defaults');
            // Fallback: extract main keyword
            searchAttempts = [
                { type: 'name', term: userQuery.split(' ')[0] },
                { type: 'ingredient', term: 'chicken' }
            ];
        }

        // Try each search attempt until we find results
        let meals: any[] = [];
        let successfulAttempt: { type: string, term: string } | null = null;

        for (const attempt of searchAttempts) {
            console.log(`[RecipeWorker] Attempt: ${attempt.type} = "${attempt.term}"`);

            try {
                switch (attempt.type) {
                    case 'name':
                        meals = await searchByName(attempt.term);
                        break;
                    case 'ingredient':
                        meals = await filterByIngredient(attempt.term);
                        break;
                    case 'area':
                        meals = await filterByArea(attempt.term);
                        break;
                    case 'category':
                        meals = await filterByCategory(attempt.term);
                        break;
                }

                if (meals.length > 0) {
                    console.log(`[RecipeWorker] SUCCESS! Found ${meals.length} results with ${attempt.type}="${attempt.term}"`);
                    successfulAttempt = attempt;
                    break;
                } else {
                    console.log(`[RecipeWorker] No results for ${attempt.type}="${attempt.term}", trying next...`);
                }
            } catch (e) {
                console.warn(`[RecipeWorker] API error for ${attempt.type}="${attempt.term}":`, e);
            }
        }

        // If still no results after all attempts
        if (meals.length === 0) {
            console.log('[RecipeWorker] All attempts failed, no recipes found');
            return {
                toolName: 'suggest_recipes',
                success: false,
                data: { userQuery, attempts: searchAttempts },
                error: `Could not find recipes for "${userQuery}" after trying multiple search strategies.`
            };
        }

        // Return top 5 suggestions (just summaries, user will choose)
        // IMPORTANT: Keep englishTitle for API calls since TheMealDB only works with English
        const suggestions = meals.slice(0, 5).map((m: any) => ({
            id: m.idMeal,
            title: m.strMeal,           // Original English title (for API)
            englishTitle: m.strMeal,    // Keep original for API lookup
            image: m.strMealThumb,
            category: m.strCategory || null,
            area: m.strArea || null
        }));

        // Determine if the results are an exact match or a fallback
        const searchType = successfulAttempt?.type || 'name';
        const isExactMatch = searchType === 'name'; // Only name search gives exact matches
        const isFallback = searchType === 'area' || searchType === 'category' || searchType === 'ingredient';

        console.log(`[RecipeWorker] Returning ${suggestions.length} suggestions (exact: ${isExactMatch}, fallback: ${isFallback})`);

        return {
            toolName: 'suggest_recipes',
            success: true,
            data: {
                suggestions,
                totalFound: meals.length,
                searchStrategy: searchType,
                searchTerm: successfulAttempt?.term || userQuery,
                userQuery,
                isExactMatch,
                isFallback,
                note: isFallback
                    ? `Could not find exact match for "${userQuery}". Showing ${searchType} results for "${successfulAttempt?.term}".`
                    : null
            }
        };

    } catch (error) {
        console.error('[RecipeWorker] Error:', error);
        return {
            toolName: 'suggest_recipes',
            success: false,
            data: { userQuery },
            error: error instanceof Error ? error.message : 'Failed to search for recipes'
        };
    }
}

/**
 * Get full recipe details by name
 * Called when user selects a recipe from the suggestions
 */
export async function getRecipeDetails(params: {
    recipeName: string;
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    const { recipeName, language } = params;

    console.log(`[RecipeWorker] Fetching details for recipe: "${recipeName}"`);

    try {
        // Search by name to get the recipe
        const meals = await searchByName(recipeName);

        if (!meals || meals.length === 0) {
            console.log(`[RecipeWorker] No recipe found with name "${recipeName}"`);
            return {
                toolName: 'get_recipe_details',
                success: false,
                data: null,
                error: `Recipe "${recipeName}" not found`
            };
        }

        // Get the first matching result (should be exact or close match)
        const mealDetails = meals[0];

        console.log(`[RecipeWorker] Found recipe: ${mealDetails.strMeal} (ID: ${mealDetails.idMeal})`);

        const recipe = mapMealToRecipe(mealDetails, language);

        return {
            toolName: 'get_recipe_details',
            success: true,
            data: { recipe }
        };
    } catch (error) {
        console.error('[RecipeWorker] Error fetching details:', error);
        return {
            toolName: 'get_recipe_details',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch recipe details'
        };
    }
}

/**
 * Find grocery deals for items
 */
export async function findGroceryDeals(params: {
    items: string[];
    maxDistanceKm?: number;
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 700));

        const maxDistance = params.maxDistanceKm || 10;

        const filteredItems = ALL_ITEMS.map(item => {
            const availablePrices = item.prices.filter(
                p => p.distanceKm <= maxDistance && p.inStock
            );
            return { ...item, prices: availablePrices };
        }).filter(item => item.prices.length > 0);

        const bestDeals = filteredItems.filter(item => {
            const minPrice = Math.min(...item.prices.map(p => p.priceVND));
            return minPrice < item.basePriceVND * 0.9;
        }).slice(0, 3);

        return {
            toolName: 'find_grocery_deals',
            success: true,
            data: {
                items: filteredItems.slice(0, 8),
                bestDeals,
                totalSavings: calculateSavings(bestDeals, params.language)
            }
        };
    } catch (error) {
        return {
            toolName: 'find_grocery_deals',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to find deals'
        };
    }
}

// =============================================================================
// Helper Functions
// =============================================================================

function mapMealToRecipe(meal: any, language: 'en' | 'vi'): GeneratedRecipe {
    const ingredients: { name: { en: string; vi: string }; amount: string }[] = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push({
                name: { en: ingredient, vi: ingredient },
                amount: measure?.trim() || ''
            });
        }
    }

    const instructions = meal.strInstructions
        ?.split(/\r\n|\n/)
        .filter((s: string) => s.trim().length > 5)
        .map((s: string) => ({
            en: s.trim(),
            vi: s.trim()
        })) || [];

    return {
        id: meal.idMeal,
        title: { en: meal.strMeal, vi: meal.strMeal },
        time: { en: '45 mins', vi: '45 phút' },
        calories: 500,
        image: meal.strMealThumb,
        ingredients,
        steps: instructions
    };
}

// Note: All recipes are fetched from TheMealDB API
// The AI agent handles translation and language-specific responses

function calculateSavings(bestDeals: GroceryItem[], language: 'en' | 'vi'): string {
    const totalSaved = bestDeals.reduce((sum, item) => {
        const minPrice = Math.min(...item.prices.map(p => p.priceVND));
        return sum + (item.basePriceVND - minPrice);
    }, 0);

    if (language === 'vi') {
        return `${totalSaved.toLocaleString('vi-VN')} ₫`;
    }
    return `$${(totalSaved / 25000).toFixed(2)}`;
}
