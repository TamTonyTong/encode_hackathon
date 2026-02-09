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

// =============================================================================
// Intent Extraction for Recipe Agent
// =============================================================================

// Known categories from TheMealDB
const CATEGORIES = ['beef', 'chicken', 'dessert', 'lamb', 'miscellaneous', 'pasta', 'pork', 'seafood', 'side', 'starter', 'vegan', 'vegetarian', 'breakfast', 'goat'];

// Known areas/cuisines from TheMealDB
const AREAS = ['american', 'british', 'canadian', 'chinese', 'croatian', 'dutch', 'egyptian', 'filipino', 'french', 'greek', 'indian', 'irish', 'italian', 'jamaican', 'japanese', 'kenyan', 'malaysian', 'mexican', 'moroccan', 'polish', 'portuguese', 'russian', 'spanish', 'thai', 'tunisian', 'turkish', 'ukrainian', 'vietnamese'];

interface RecipeIntent {
    type: 'name' | 'ingredient' | 'category' | 'area' | 'random';
    value: string;
    confidence: number;
}

function extractRecipeIntent(query: string, ingredients?: string[]): RecipeIntent[] {
    const lowerQuery = query.toLowerCase();
    const intents: RecipeIntent[] = [];

    // Check for "random" or "surprise me" intent
    if (/random|surprise|anything|whatever|bất kỳ|ngẫu nhiên/i.test(lowerQuery)) {
        intents.push({ type: 'random', value: '', confidence: 0.9 });
    }

    // Check for specific dish names (keywords that suggest a dish)
    // Common dish patterns
    const dishKeywords = [
        'pasta', 'curry', 'soup', 'salad', 'steak', 'burger', 'pizza', 'tacos',
        'sandwich', 'stir fry', 'noodles', 'rice', 'casserole', 'pie', 'cake',
        'chicken', 'beef', 'pork', 'fish', 'shrimp', 'lamb',
        'arrabiata', 'carbonara', 'tikka', 'masala', 'teriyaki', 'pad thai',
        'phở', 'bánh mì', 'bún', 'cơm', 'gà', 'bò', 'heo'
    ];

    for (const dish of dishKeywords) {
        if (lowerQuery.includes(dish)) {
            intents.push({ type: 'name', value: dish, confidence: 0.85 });
        }
    }

    // Check for category matches
    for (const cat of CATEGORIES) {
        if (lowerQuery.includes(cat)) {
            intents.push({ type: 'category', value: cat, confidence: 0.8 });
        }
    }

    // Check for area/cuisine matches
    for (const area of AREAS) {
        if (lowerQuery.includes(area)) {
            intents.push({ type: 'area', value: area, confidence: 0.85 });
        }
    }

    // If ingredients are provided, use them as a fallback search strategy
    if (ingredients && ingredients.length > 0) {
        // Use the most specific/uncommon ingredient for filtering
        const mainIngredient = ingredients[0]; // Could be smarter here
        intents.push({ type: 'ingredient', value: mainIngredient, confidence: 0.7 });
    }

    // Sort by confidence
    intents.sort((a, b) => b.confidence - a.confidence);

    // If nothing matched, try searching the whole query as a dish name
    if (intents.length === 0) {
        // Extract potential dish name from the query
        // Remove common filler words
        const cleanedQuery = lowerQuery
            .replace(/i want|i('d)? like|make me|cook me|suggest|recommend|can you|please|some|a|an|the|for|dinner|lunch|breakfast|meal|food|dish|recipe|món|nấu|làm|gợi ý|muốn ăn|ăn gì/gi, '')
            .trim();

        if (cleanedQuery.length > 2) {
            intents.push({ type: 'name', value: cleanedQuery, confidence: 0.6 });
        } else {
            // Last resort: random
            intents.push({ type: 'random', value: '', confidence: 0.3 });
        }
    }

    return intents;
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
 * Intelligent Recipe Agent
 * Understands user intent and queries TheMealDB appropriately.
 */
export async function suggestRecipes(params: {
    query: string;
    ingredients?: string[];
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        const { query, ingredients, language } = params;

        // 1. Extract intent from the user's query
        const intents = extractRecipeIntent(query, ingredients);
        console.log('[RecipeAgent] Detected intents:', intents);

        let meals: any[] = [];

        // 2. Try each intent strategy in order of confidence until we get results
        for (const intent of intents) {
            if (meals.length > 0) break; // Already found results

            console.log(`[RecipeAgent] Trying strategy: ${intent.type} = "${intent.value}"`);

            switch (intent.type) {
                case 'name':
                    meals = await searchByName(intent.value);
                    break;
                case 'ingredient':
                    meals = await filterByIngredient(intent.value);
                    break;
                case 'category':
                    meals = await filterByCategory(intent.value);
                    break;
                case 'area':
                    meals = await filterByArea(intent.value);
                    break;
                case 'random':
                    meals = await getRandomMeal();
                    break;
            }
        }

        // 3. If still no results, try a random meal as ultimate fallback
        if (meals.length === 0) {
            console.log('[RecipeAgent] No results found, falling back to random meal');
            meals = await getRandomMeal();
        }

        // 4. If API failed entirely, return failure so the Agent knows
        if (meals.length === 0) {
            console.log('[RecipeAgent] API returned no results, and mock fallback is disabled.');
            return {
                toolName: 'suggest_recipes',
                success: false,
                data: null,
                error: 'No recipes found for the given criteria.'
            };
        }

        // 5. Get full details for the first (best) meal
        const topMeal = meals[0];
        let mealDetails = topMeal;

        // If we only got summary data (from filter endpoints), fetch full details
        if (!topMeal.strInstructions) {
            mealDetails = await getMealDetails(topMeal.idMeal);
            if (!mealDetails) {
                throw new Error('Failed to fetch recipe details');
            }
        }

        // 6. Map to GeneratedRecipe format
        const recipe = mapMealToRecipe(mealDetails, language);

        // 7. Get summary of alternatives
        const alternatives = meals.slice(1, 4).map((m: any) => ({
            id: m.idMeal,
            title: { en: m.strMeal, vi: m.strMeal },
            image: m.strMealThumb
        }));

        return {
            toolName: 'suggest_recipes',
            success: true,
            data: {
                recipe,
                alternatives,
                searchStrategy: intents[0]?.type || 'unknown'
            }
        };

    } catch (error) {
        console.error('[RecipeAgent] Error:', error);
        return {
            toolName: 'suggest_recipes',
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to suggest recipes'
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

function getDetailedMockRecipe(recipeId: string): GeneratedRecipe {
    return {
        id: "ga-xao-xa-ot",
        title: { en: "Lemongrass Chili Chicken", vi: "Gà Xào Xả Ớt" },
        time: { en: "30 mins", vi: "30 phút" },
        calories: 420,
        image: "🍗",
        ingredients: [
            { name: { en: "Chicken thigh (500g)", vi: "Đùi gà (500g)" }, amount: "500g" },
            { name: { en: "Lemongrass", vi: "Xả" }, amount: "3 stalks" },
            { name: { en: "Chili", vi: "Ớt" }, amount: "2-3 pcs" },
            { name: { en: "Garlic", vi: "Tỏi" }, amount: "5 cloves" },
            { name: { en: "Fish sauce", vi: "Nước mắm" }, amount: "2 tbsp" },
            { name: { en: "Sugar", vi: "Đường" }, amount: "1 tbsp" },
            { name: { en: "Cooking oil", vi: "Dầu ăn" }, amount: "3 tbsp" },
        ],
        steps: [
            { en: "Cut chicken into bite-sized pieces, marinate with fish sauce and sugar for 15 mins", vi: "Cắt gà thành miếng vừa ăn, ướp với nước mắm và đường 15 phút" },
            { en: "Mince lemongrass and chili finely", vi: "Băm nhỏ xả và ớt" },
            { en: "Heat oil, fry garlic until fragrant", vi: "Đun nóng dầu, phi thơm tỏi" },
            { en: "Add chicken, stir-fry until golden", vi: "Cho gà vào xào vàng đều" },
            { en: "Add lemongrass and chili, stir-fry for 5 more minutes", vi: "Thêm xả và ớt, xào thêm 5 phút" },
            { en: "Season to taste and serve hot with rice", vi: "Nêm nếm vừa ăn, dọn nóng với cơm" },
        ]
    };
}

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
