import {
    ToolCallResult,
    analyzeIngredients,
    suggestRecipes,
    findGroceryDeals
} from './agentTools';
import { GeneratedRecipe } from '../services/chatService';

// =============================================================================
// Agent Types
// =============================================================================

export interface AgentRequest {
    message: string;
    image?: string;
    language: 'en' | 'vi';
    conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AgentResponse {
    reply: string;
    toolCalls: ToolCallResult[];
    recipe?: GeneratedRecipe;
    ingredients?: string[];
    groceryDeals?: {
        items: unknown[];
        bestDeals: unknown[];
        totalSavings: string;
    };
}

// =============================================================================
// Intent Detection
// =============================================================================

type IntentType = 'analyze_ingredients' | 'suggest_recipes' | 'find_grocery_deals' | 'general';

interface DetectedIntent {
    type: IntentType;
    confidence: number;
}

const INTENT_PATTERNS: Record<IntentType, RegExp[]> = {
    analyze_ingredients: [
        /what('s| is| are)? (in|inside)/i,
        /fridge|refrigerator|pantry/i,
        /these ingredients/i,
        /i have/i,
        /what can i (make|cook)/i,
        /(identify|detect|analyze|scan)/i,
        /tủ lạnh|nguyên liệu|đồ ăn/i,
        /tôi có/i,
    ],
    suggest_recipes: [
        /recipe|món|dish/i,
        /cook|nấu|làm/i,
        /suggest|gợi ý|recommend/i,
        /(make|prepare) (something|food)/i,
        /hungry|đói/i,
        /what (should|can) (i|we) (eat|cook|make)/i,
        /ăn gì/i,
    ],
    find_grocery_deals: [
        /buy|mua|shop|purchase/i,
        /price|giá|cost/i,
        /deal|sale|discount|khuyến mãi|giảm giá/i,
        /where (to|can) (get|buy|find)/i,
        /grocery|siêu thị|chợ/i,
        /order|đặt hàng/i,
    ],
    general: [
        /^(hi|hello|hey|xin chào|chào)/i,
        /help|giúp/i,
        /thank|cảm ơn/i,
    ]
};

function detectIntent(message: string, hasImage: boolean): DetectedIntent[] {
    const intents: DetectedIntent[] = [];

    // Image + message strongly suggests ingredient analysis
    if (hasImage) {
        intents.push({ type: 'analyze_ingredients', confidence: 0.9 });
    }

    // Check patterns
    for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(message)) {
                const existing = intents.find(i => i.type === intentType);
                if (existing) {
                    existing.confidence = Math.min(existing.confidence + 0.2, 1.0);
                } else {
                    intents.push({
                        type: intentType as IntentType,
                        confidence: 0.7
                    });
                }
            }
        }
    }

    // Sort by confidence
    intents.sort((a, b) => b.confidence - a.confidence);

    // Default to recipe suggestion if no clear intent
    if (intents.length === 0) {
        intents.push({ type: 'suggest_recipes', confidence: 0.5 });
    }

    return intents;
}

// =============================================================================
// Agent Orchestrator
// =============================================================================

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
    const { message, image, language } = request;
    const toolCalls: ToolCallResult[] = [];
    let reply = '';
    let recipe: GeneratedRecipe | undefined;
    let ingredients: string[] | undefined;
    let groceryDeals: AgentResponse['groceryDeals'] | undefined;

    // Detect user intent
    const intents = detectIntent(message, !!image);
    const primaryIntent = intents[0];

    // Handle general intents without tools
    if (primaryIntent.type === 'general') {
        reply = getGeneralResponse(message, language);
        return { reply, toolCalls };
    }

    // Execute tools based on intent
    if (primaryIntent.type === 'analyze_ingredients' || (image && primaryIntent.confidence > 0.5)) {
        // Step 1: Analyze ingredients
        const analyzeResult = await analyzeIngredients({
            image,
            text: !image ? message : undefined,
            language
        });
        toolCalls.push(analyzeResult);

        if (analyzeResult.success) {
            const data = analyzeResult.data as { ingredients: string[]; source: string };
            ingredients = data.ingredients;

            // Step 2: Auto-suggest recipes based on detected ingredients
            const recipeResult = await suggestRecipes({
                ingredients,
                language
            });
            toolCalls.push(recipeResult);

            if (recipeResult.success) {
                const recipeData = recipeResult.data as { recipe: GeneratedRecipe };
                recipe = recipeData.recipe;

                reply = language === 'vi'
                    ? `Tôi thấy bạn có: **${ingredients.join(', ')}**\n\nDựa trên nguyên liệu này, tôi gợi ý món **${recipe.title.vi}**! 🍳`
                    : `I see you have: **${ingredients.join(', ')}**\n\nBased on these ingredients, I suggest **${recipe.title.en}**! 🍳`;
            }
        }
    } else if (primaryIntent.type === 'suggest_recipes') {
        // Recipe suggestion
        const recipeResult = await suggestRecipes({
            language
        });
        toolCalls.push(recipeResult);

        if (recipeResult.success) {
            const recipeData = recipeResult.data as { recipe: GeneratedRecipe };
            recipe = recipeData.recipe;

            reply = language === 'vi'
                ? `Tuyệt vời! Tôi gợi ý món **${recipe.title.vi}** - một món ăn đậm đà hương vị Việt Nam! 🍗\n\nMón này cần ${recipe.ingredients.length} nguyên liệu và mất khoảng ${recipe.time.vi}.`
                : `Great choice! I recommend **${recipe.title.en}** - a delicious Vietnamese classic! 🍗\n\nThis dish needs ${recipe.ingredients.length} ingredients and takes about ${recipe.time.en}.`;
        }
    } else if (primaryIntent.type === 'find_grocery_deals') {
        // Grocery shopping
        const items = extractItemsFromMessage(message);
        const dealsResult = await findGroceryDeals({
            items,
            language
        });
        toolCalls.push(dealsResult);

        if (dealsResult.success) {
            groceryDeals = dealsResult.data as AgentResponse['groceryDeals'];

            reply = language === 'vi'
                ? `🛒 Tôi đã tìm được giá tốt nhất cho bạn!\n\nBạn có thể tiết kiệm đến **${groceryDeals?.totalSavings}** khi mua ở các cửa hàng gần đây.`
                : `🛒 I found the best prices for you!\n\nYou can save up to **${groceryDeals?.totalSavings}** by shopping at nearby stores.`;
        }
    }

    // Fallback if no tools succeeded
    if (!reply) {
        reply = language === 'vi'
            ? 'Xin lỗi, tôi không hiểu yêu cầu. Bạn có thể hỏi về công thức nấu ăn hoặc tải ảnh nguyên liệu!'
            : "Sorry, I didn't understand. Try asking about recipes or upload a photo of ingredients!";
    }

    return { reply, toolCalls, recipe, ingredients, groceryDeals };
}

// =============================================================================
// Helper Functions
// =============================================================================

function getGeneralResponse(message: string, language: 'en' | 'vi'): string {
    const lowerMessage = message.toLowerCase();

    if (/^(hi|hello|hey|xin chào|chào)/i.test(lowerMessage)) {
        return language === 'vi'
            ? 'Xin chào! Tôi là Aura AI, trợ lý nấu ăn của bạn. Hãy cho tôi biết bạn muốn nấu gì hôm nay? 🍳'
            : "Hello! I'm Aura AI, your cooking assistant. What would you like to cook today? 🍳";
    }

    if (/help|giúp/i.test(lowerMessage)) {
        return language === 'vi'
            ? 'Tôi có thể giúp bạn:\n• 📸 Phân tích ảnh nguyên liệu\n• 🍳 Gợi ý công thức nấu ăn\n• 🛒 Tìm giá tốt nhất cho nguyên liệu\n\nHãy thử: "Gợi ý món gà ngon đi!" hoặc tải ảnh tủ lạnh của bạn!'
            : "I can help you:\n• 📸 Analyze ingredient photos\n• 🍳 Suggest recipes\n• 🛒 Find the best grocery prices\n\nTry: \"Suggest a chicken recipe!\" or upload a photo of your fridge!";
    }

    if (/thank|cảm ơn/i.test(lowerMessage)) {
        return language === 'vi'
            ? 'Không có gì! Chúc bạn nấu ăn ngon miệng! 👨‍🍳'
            : "You're welcome! Enjoy your cooking! 👨‍🍳";
    }

    return language === 'vi'
        ? 'Tôi sẵn sàng hỗ trợ bạn! Hãy hỏi về công thức hoặc tải ảnh nguyên liệu.'
        : "I'm ready to help! Ask about recipes or upload ingredient photos.";
}

function extractItemsFromMessage(message: string): string[] {
    // Simple extraction - look for comma-separated items or common ingredient words
    const commonItems = [
        'chicken', 'pork', 'beef', 'fish', 'rice', 'garlic', 'onion', 'chili',
        'gà', 'heo', 'bò', 'cá', 'gạo', 'tỏi', 'hành', 'ớt'
    ];

    const found = commonItems.filter(item =>
        message.toLowerCase().includes(item.toLowerCase())
    );

    return found.length > 0 ? found : ['chicken', 'rice', 'vegetables'];
}
