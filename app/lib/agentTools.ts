import { MOCK_RECIPES, MOCK_ITEMS, ALL_ITEMS, GroceryItem } from './mockData';
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
        description: 'Analyze an image or text to identify food ingredients. Use when user uploads a photo of their fridge, groceries, or describes what they have.',
        parameters: {
            image: { type: 'string', description: 'Base64 encoded image data', required: false },
            text: { type: 'string', description: 'Text description of ingredients', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    },
    {
        name: 'suggest_recipes',
        description: 'Suggest recipes based on available ingredients and user preferences. Use when user asks for recipe ideas or wants to cook something.',
        parameters: {
            ingredients: { type: 'array', description: 'List of available ingredients', required: false },
            preferences: { type: 'object', description: 'User preferences (cuisine, dietary, calories)', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    },
    {
        name: 'find_grocery_deals',
        description: 'Find the best prices and deals for groceries. Use when user wants to buy ingredients or asks about prices.',
        parameters: {
            items: { type: 'array', description: 'List of items to search for', required: true },
            maxDistanceKm: { type: 'number', description: 'Maximum distance in km', required: false },
            language: { type: 'string', description: 'Language code (en/vi)', required: true }
        }
    }
];

// =============================================================================
// Tool Implementations
// =============================================================================

/**
 * Analyze image/text to extract ingredients
 * TODO: Replace with actual vision AI (GPT-4V, Gemini Vision)
 */
export async function analyzeIngredients(params: {
    image?: string;
    text?: string;
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        let ingredients: string[];

        if (params.text) {
            // Parse text input
            ingredients = params.text.split(/[,，、;\n]+/).map(i => i.trim()).filter(Boolean);
        } else if (params.image) {
            // Mock image analysis - in production, call Vision AI
            ingredients = params.language === 'vi'
                ? ['Thịt gà', 'Xả', 'Ớt', 'Tỏi', 'Hành']
                : ['Chicken', 'Lemongrass', 'Chili', 'Garlic', 'Onion'];
        } else {
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
 * Suggest recipes based on ingredients
 * TODO: Replace with actual AI recipe generation
 */
export async function suggestRecipes(params: {
    ingredients?: string[];
    preferences?: {
        cuisine?: string;
        dietaryRestrictions?: string[];
        maxCalories?: number;
    };
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 600));

        // Filter mock recipes based on preferences
        let recipes = [...MOCK_RECIPES];

        if (params.preferences?.maxCalories) {
            recipes = recipes.filter(r => r.calories <= params.preferences!.maxCalories!);
        }

        // Convert to GeneratedRecipe format with full details
        const recipe = getDetailedRecipe(recipes[0]?.id || 'ga-xao-xa-ot');

        return {
            toolName: 'suggest_recipes',
            success: true,
            data: {
                recipe,
                alternatives: recipes.slice(1, 3).map(r => ({
                    id: r.id,
                    title: r.title,
                    image: r.image
                }))
            }
        };
    } catch (error) {
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
 * TODO: Replace with actual price scraping service
 */
export async function findGroceryDeals(params: {
    items: string[];
    maxDistanceKm?: number;
    language: 'en' | 'vi';
}): Promise<ToolCallResult> {
    try {
        await new Promise(resolve => setTimeout(resolve, 700));

        const maxDistance = params.maxDistanceKm || 10;

        // Filter items by distance
        const filteredItems = ALL_ITEMS.map(item => {
            const availablePrices = item.prices.filter(
                p => p.distanceKm <= maxDistance && p.inStock
            );
            return { ...item, prices: availablePrices };
        }).filter(item => item.prices.length > 0);

        // Find best deals (>10% off base price)
        const bestDeals = filteredItems.filter(item => {
            const minPrice = Math.min(...item.prices.map(p => p.priceVND));
            return minPrice < item.basePriceVND * 0.9;
        }).slice(0, 3);

        return {
            toolName: 'find_grocery_deals',
            success: true,
            data: {
                items: filteredItems.slice(0, 8), // Limit results
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

function getDetailedRecipe(recipeId: string): GeneratedRecipe {
    // The featured recipe with full details
    const GA_XAO_XA_OT: GeneratedRecipe = {
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

    // Add more recipes as needed
    const recipes: Record<string, GeneratedRecipe> = {
        'ga-xao-xa-ot': GA_XAO_XA_OT,
    };

    return recipes[recipeId] || GA_XAO_XA_OT;
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
