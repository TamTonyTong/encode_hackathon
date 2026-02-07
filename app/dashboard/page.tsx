"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ChatInterface, { Message } from "../components/ChatInterface";
import IngredientRow from "../components/IngredientRow";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { useRecipes } from "../context/RecipeContext";
import { ChatService, GeneratedRecipe } from "../services/chatService";
import LanguageToggle from "../components/LanguageToggle";

interface Ingredient {
    name: string;
    source: string;
    price: string;
    status: "searching" | "found" | "out_of_stock";
}

export default function DashboardPage() {
    const { showToast } = useToast();
    const { language, t } = useLanguage();
    const { addRecipe } = useRecipes();

    // State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState<GeneratedRecipe | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: "ai", 
            content: language === 'vi' 
                ? "Xin chào! Tải ảnh nguyên liệu hoặc cho tôi biết bạn muốn nấu gì. Tôi sẽ gợi ý món ngon cho bạn! 🍳" 
                : "Hello! Upload a photo of your ingredients or tell me what you're craving. I'll suggest delicious recipes! 🍳"
        },
    ]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    const handleOrder = () => {
        showToast(language === 'vi' ? "Đang xử lý đơn hàng..." : "Processing order...", "success");
    };

    const handleSendMessage = async (text: string) => {
        // Add user message immediately
        setMessages(prev => [...prev, { role: "user", content: text }]);
        setIsLoading(true);

        try {
            // Call the chat API
            const response = await ChatService.sendMessage({
                message: text,
                language: language
            });

            // Add AI response
            setMessages(prev => [...prev, { role: "ai", content: response.reply }]);

            // If a recipe was generated, update the ingredients list
            if (response.recipe) {
                setCurrentRecipe(response.recipe);
                
                // Add to shared context so it appears in Grocery tab
                addRecipe(response.recipe);
                
                // Convert recipe ingredients to grocery list format
                const groceryItems: Ingredient[] = response.recipe.ingredients.map((ing, index) => ({
                    name: ing.name[language],
                    source: language === 'vi' ? "Đang tìm..." : "Searching...",
                    price: "--",
                    status: "searching" as const
                }));
                
                setIngredients(groceryItems);
                showToast(
                    language === 'vi' 
                        ? `Đã tìm thấy công thức: ${response.recipe.title.vi}` 
                        : `Found recipe: ${response.recipe.title.en}`,
                    "success"
                );

                // Simulate finding prices after 2 seconds
                setTimeout(() => {
                    setIngredients(prev => prev.map((ing, idx) => ({
                        ...ing,
                        source: language === 'vi' ? "Bách Hóa Xanh" : "Local Market",
                        price: language === 'vi' ? `${(15000 + idx * 8000).toLocaleString('vi-VN')} ₫` : `$${(1.5 + idx * 0.8).toFixed(2)}`,
                        status: "found" as const
                    })));
                }, 2000);

                // Add recipe steps as a follow-up message
                setTimeout(() => {
                    const stepsMessage = response.recipe!.steps
                        .map((step, i) => `${i + 1}. ${step[language]}`)
                        .join('\n');
                    
                    setMessages(prev => [...prev, { 
                        role: "ai", 
                        content: language === 'vi' 
                            ? `📝 **Các bước nấu:**\n\n${stepsMessage}`
                            : `📝 **Cooking Steps:**\n\n${stepsMessage}`
                    }]);
                }, 1500);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: "ai", 
                content: language === 'vi' 
                    ? "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!" 
                    : "Sorry, an error occurred. Please try again!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSample = () => {
        if (imageSrc) return;

        setImageSrc("/sample_fridge.png");
        showToast(language === 'vi' ? "Đang tải ảnh mẫu..." : "Uploading sample image...", "neutral");

        setMessages(prev => [...prev, { 
            role: "ai", 
            content: language === 'vi' ? "Tuyệt! Đang phân tích ảnh tủ lạnh..." : "Great! Analyzing this fridge photo..."
        }]);

        setTimeout(() => {
            handleSendMessage(language === 'vi' ? "Gợi ý món gà ngon đi!" : "Suggest a delicious chicken recipe!");
        }, 1500);
    };

    // Calculate total
    const calculateTotal = () => {
        if (ingredients.length === 0) return language === 'vi' ? "0 ₫" : "$0.00";
        
        const foundItems = ingredients.filter(i => i.status === "found");
        if (foundItems.length === 0) return language === 'vi' ? "Đang tính..." : "Calculating...";
        
        if (language === 'vi') {
            const total = foundItems.reduce((sum, ing) => {
                const price = parseInt(ing.price.replace(/[^\d]/g, '')) || 0;
                return sum + price;
            }, 0);
            return `${total.toLocaleString('vi-VN')} ₫`;
        } else {
            const total = foundItems.reduce((sum, ing) => {
                const price = parseFloat(ing.price.replace(/[^0-9.]/g, '')) || 0;
                return sum + price;
            }, 0);
            return `$${total.toFixed(2)}`;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Input & Chat */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                {/* Header with Language Toggle */}
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {language === 'vi' ? "Lên Kế Hoạch Bữa Ăn" : "Meal Planning"}
                    </h1>
                    <LanguageToggle />
                </div>

                {/* Image Uploader */}
                <div className="shrink-0">
                    <ImageUploader imageSrc={imageSrc} onSampleClick={handleSample} />
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-0">
                    <ChatInterface 
                        messages={messages} 
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Right Column: Recipe & Grocery */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
                {/* Recipe Card (if available) */}
                {currentRecipe && (
                    <div className="mb-4 p-4 bg-[var(--accent-glow)] rounded-xl border border-[var(--accent-primary)]">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{currentRecipe.image}</span>
                            <div>
                                <h3 className="font-bold text-[var(--text-primary)]">
                                    {currentRecipe.title[language]}
                                </h3>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    ⏱️ {currentRecipe.time[language]} • 🔥 {currentRecipe.calories} kcal
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        {language === 'vi' ? "Danh Sách Nguyên Liệu" : "Ingredient List"}
                    </h2>
                    <span className="px-2 py-1 rounded bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {ingredients.length} {language === 'vi' ? "món" : "Items"}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {ingredients.length === 0 ? (
                        <div className="text-center py-10 text-[var(--text-muted)]">
                            <p>{language === 'vi' ? "Chat với AI để nhận công thức nấu ăn!" : "Chat with AI to get a recipe!"}</p>
                        </div>
                    ) : (
                        ingredients.map((ing, i) => (
                            <IngredientRow
                                key={i}
                                name={ing.name}
                                source={ing.source}
                                price={ing.price}
                                status={ing.status}
                            />
                        ))
                    )}
                </div>

                {/* Order Summary / Action */}
                {ingredients.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-[var(--text-secondary)]">
                                {language === 'vi' ? "Tổng ước tính" : "Estimated Total"}
                            </span>
                            <span className="font-bold text-[var(--text-primary)]">{calculateTotal()}</span>
                        </div>
                        <button
                            onClick={handleOrder}
                            className="w-full py-3 bg-[var(--text-primary)] text-black font-bold rounded-xl hover:bg-[var(--accent-primary)] transition-colors duration-300 shadow-lg shadow-white/5"
                        >
                            {language === 'vi' ? "Tìm & Đặt Hàng" : "Find & Order All"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
