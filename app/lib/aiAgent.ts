import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
    ToolCallResult,
    analyzeIngredients,
    suggestRecipes,
    getRecipeDetails,
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
    conversationHistory?: { role: 'user' | 'assistant'; content: string; image?: string }[];
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
// Helper Functions (Shared)
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

// =============================================================================
// Agent Orchestrator with Gemini 2.0 Flash
// =============================================================================

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
    const { message, image, language, conversationHistory } = request;
    const toolCalls: ToolCallResult[] = [];
    let recipe: GeneratedRecipe | undefined;
    let ingredients: string[] | undefined;
    let groceryDeals: AgentResponse['groceryDeals'] | undefined;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("Missing GEMINI_API_KEY. Using legacy regex logic.");
        return runLegacyRegexAgent(request);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Build system instruction with language context
        const systemInstruction = `You are Aura AI, a helpful cooking and meal planning assistant.

LANGUAGE:
- User's language: ${language === 'vi' ? 'Vietnamese (Tiếng Việt)' : 'English'}
- Always respond in the user's language
- You may translate recipe titles when displaying to user, but ALWAYS use englishTitle for API calls

RECIPE SEARCH FLOW:
1. When user asks for recipes, call suggest_recipes with their query
2. Check the response for "isFallback" and "note" fields
3. If isFallback is TRUE:
   - The exact dish was NOT found in the database
   - Present the "note" field to explain this to the user
   - Show the alternative suggestions but clarify they are similar dishes
4. If isFallback is FALSE:
   - Good match! Present the suggestions as options
5. When user selects a recipe, call get_recipe_details with the recipe's ENGLISH TITLE (englishTitle field)
   - CRITICAL: Always use the englishTitle from suggestions, NOT a translated name
6. Present the full recipe details from the API response

IMPORTANT RULES:
- ONLY present recipe data from the API. NEVER make up ingredients or cooking steps.
- When calling get_recipe_details, use the EXACT englishTitle from suggestions (e.g., "Chicken Basquaise" not "Gà Basquaise")
- When isFallback is true, be HONEST that the exact dish wasn't found.

TOOLS:
- suggest_recipes: Search for recipes. Returns suggestions with englishTitle + isFallback flag.
- get_recipe_details: Get full recipe. MUST use englishTitle from suggestions.
- detect_ingredients_from_image: When user uploads food/ingredient image
- find_deals: Find grocery prices`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            tools: [{
                functionDeclarations: [
                    {
                        name: "detect_ingredients_from_image",
                        description: "Detect ingredients from an image. You MUST list the visible ingredients found in the image.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                ingredients_found: { type: SchemaType.STRING, description: "Comma-separated list of ingredients you see in the image." }
                            },
                            required: ["ingredients_found"]
                        }
                    },
                    {
                        name: "suggest_recipes",
                        description: "Search for recipes. Returns top 5 suggestions. User should choose one to get full details.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                user_query: {
                                    type: SchemaType.STRING,
                                    description: "The user's request for recipes (can be in any language)"
                                },
                                ingredients: {
                                    type: SchemaType.ARRAY,
                                    items: { type: SchemaType.STRING },
                                    description: "Optional list of available ingredients"
                                }
                            },
                            required: ["user_query"]
                        }
                    },
                    {
                        name: "get_recipe_details",
                        description: "Get full recipe details. IMPORTANT: Use the englishTitle from suggestions, NOT a translated name.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                recipe_name: {
                                    type: SchemaType.STRING,
                                    description: "The ENGLISH recipe title (englishTitle field from suggestions). Example: 'Chicken Basquaise' not 'Gà Basquaise'"
                                }
                            },
                            required: ["recipe_name"]
                        }
                    },
                    {
                        name: "find_deals",
                        description: "Find grocery deals for specific items.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                items: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of items to buy." }
                            },
                            required: ["items"]
                        }
                    }
                ]
            }]
        });

        // Optimize history: Keep only last 10 turns to reduce token usage
        let optimizedHistory = conversationHistory?.slice(-10).map(h => {
            const parts: any[] = [{ text: h.content }];
            if (h.image) {
                const base64Data = h.image.split(',')[1];
                if (base64Data) {
                    parts.unshift({
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Data
                        }
                    });
                }
            }
            return {
                role: h.role === 'user' ? 'user' : 'model',
                parts: parts
            };
        }) || [];

        // Gemini requires history to start with a user message
        if (optimizedHistory.length > 0 && optimizedHistory[0].role === 'model') {
            optimizedHistory = optimizedHistory.slice(1);
        }

        const chat = model.startChat({
            history: optimizedHistory
        });

        let parts: any[] = [{ text: message }];
        if (image) {
            const base64Data = image.split(',')[1];
            if (base64Data) {
                parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data
                    }
                });
                parts.push({ text: "Please analyze this image for ingredients first." });
            }
        }

        // Retry logic for rate limits
        const sendMessageWithRetry = async (msgParts: any[], retries = 3): Promise<any> => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await chat.sendMessage(msgParts);
                } catch (err: any) {
                    if (err.status === 429 && i < retries - 1) {
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        console.warn(`Rate limited. Retrying in ${delay}ms...`);
                        await new Promise(r => setTimeout(r, delay));
                        continue;
                    }
                    throw err;
                }
            }
        };

        const result = await sendMessageWithRetry(parts);
        const response = await result.response;
        const functionCalls = response.functionCalls();

        let finalReply = response.text();

        // Handle tool calls
        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === "detect_ingredients_from_image") {
                    const args = call.args as any;
                    // Pass the model's detected ingredients to the tool
                    const toolResult = await analyzeIngredients({
                        image: image,
                        text: args.ingredients_found,
                        language
                    });

                    toolCalls.push(toolResult);
                    if (toolResult.success) {
                        const data = toolResult.data as any;
                        ingredients = data.ingredients;
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "detect_ingredients_from_image",
                                response: { name: "detect_ingredients_from_image", content: data }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    }
                } else if (call.name === "suggest_recipes") {
                    const args = call.args as any;
                    console.log('[Agent] Delegating to Recipe Worker with query:', args.user_query);
                    const toolResult = await suggestRecipes({
                        userQuery: args.user_query || message,
                        ingredients: args.ingredients || ingredients,
                        language
                    });
                    toolCalls.push(toolResult);

                    if (toolResult.success) {
                        const data = toolResult.data as any;
                        // Pass the suggestions list with fallback info to the model
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "suggest_recipes",
                                response: {
                                    name: "suggest_recipes",
                                    content: {
                                        suggestions: data.suggestions,
                                        totalFound: data.totalFound,
                                        userQuery: data.userQuery,
                                        searchTerm: data.searchTerm,
                                        isFallback: data.isFallback,
                                        isExactMatch: data.isExactMatch,
                                        note: data.note
                                    }
                                }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    } else {
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "suggest_recipes",
                                response: { name: "suggest_recipes", content: { error: toolResult.error || "No recipes found" } }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    }

                } else if (call.name === "get_recipe_details") {
                    const args = call.args as any;
                    console.log('[Agent] Fetching recipe details for:', args.recipe_name);
                    const toolResult = await getRecipeDetails({
                        recipeName: args.recipe_name,
                        language
                    });
                    toolCalls.push(toolResult);

                    if (toolResult.success) {
                        const data = toolResult.data as any;
                        recipe = data.recipe;
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "get_recipe_details",
                                response: {
                                    name: "get_recipe_details",
                                    content: {
                                        recipe: {
                                            title: data.recipe.title,
                                            ingredients: data.recipe.ingredients,
                                            steps: data.recipe.steps,
                                            time: data.recipe.time,
                                            calories: data.recipe.calories,
                                            image: data.recipe.image
                                        }
                                    }
                                }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    } else {
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "get_recipe_details",
                                response: { name: "get_recipe_details", content: { error: toolResult.error || "Recipe not found" } }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    }

                } else if (call.name === "find_deals") {
                    const args = call.args as any;
                    const toolResult = await findGroceryDeals({
                        items: args.items,
                        language
                    });
                    toolCalls.push(toolResult);
                    if (toolResult.success) {
                        const data = toolResult.data as any;
                        groceryDeals = data;
                        const toolResponse = await sendMessageWithRetry([{
                            functionResponse: {
                                name: "find_deals",
                                response: { name: "find_deals", content: { totalSavings: data.totalSavings } }
                            }
                        }]);
                        finalReply = toolResponse.response.text();
                    }
                }
            }
        }

        return {
            reply: finalReply,
            toolCalls,
            recipe,
            ingredients,
            groceryDeals
        };

    } catch (e: any) {
        console.error("Gemini Agent Error:", e);
        // Fallback for 429 specifically
        if (e.status === 429) {
            return {
                reply: language === 'vi'
                    ? "😓 Server đang quá tải, vui lòng thử lại sau vài giây."
                    : "😓 Server is busy (Rate Limit). Please try again in a moment.",
                toolCalls: []
            };
        }
        // If it's not a rate limit error, return the actual error instead of the "Missing API Key" message
        return {
            reply: language === 'vi'
                ? `⚠️ Đã xảy ra lỗi: ${e.message || "Không xác định"}`
                : `⚠️ An error occurred: ${e.message || "Unknown error"}`,
            toolCalls: []
        };
    }
}


// =============================================================================
// Legacy Regex Agent (Fallback)
// =============================================================================

function runLegacyRegexAgent(request: AgentRequest): AgentResponse {
    const { message, image, language } = request;
    const toolCalls: ToolCallResult[] = [];

    // Simple regex detection for legacy fallback
    const lowerMessage = message.toLowerCase();

    // Check for general greetings/help first
    if (/^(hi|hello|hey|xin chào|chào)|help|giúp|thank|cảm ơn/i.test(lowerMessage)) {
        return {
            reply: getGeneralResponse(message, language),
            toolCalls: []
        };
    }

    return {
        reply: language === 'vi'
            ? "⚠️ Vui lòng thêm **GEMINI_API_KEY** vào file `.env.local` để sử dụng trí tuệ nhân tạo Gemini 2.0 Flash."
            : "⚠️ Please add your **GEMINI_API_KEY** to `.env.local` to enable Gemini 2.0 Flash AI features.",
        toolCalls: [],
    };
}
