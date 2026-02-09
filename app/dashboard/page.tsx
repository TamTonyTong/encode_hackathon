"use client";

import { useState } from "react";
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

    const handleSendMessage = async (text: string, image?: string | null) => {
        // Add user message immediately with optional image
        const userMsg: Message = { role: "user", content: text };
        if (image) userMsg.image = image;

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Mock image analysis delay if image is present
            if (image) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setMessages(prev => [...prev, {
                    role: "ai",
                    content: language === 'vi'
                        ? "Tôi đã thấy các nguyên liệu! Đây là một số gợi ý..."
                        : "I see those ingredients! Here is what we can make..."
                }]);
            }

            // Call the chat API
            const response = await ChatService.sendMessage({
                message: text || (image ? "Suggest a recipe for these ingredients" : "Hello"),
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-6rem)]">
            {/* Left Column: Chat Interface */}
            <div className="flex flex-col gap-5 h-full">
                {/* Header with Language Toggle */}
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight text-balance">
                        {language === 'vi' ? "Trợ Lý Bếp AI" : "Kitchen Assistant AI"}
                    </h1>
                    <LanguageToggle />
                </div>

                <div className="flex-1 min-h-0">
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Right Column: Recipe & Grocery Context */}
            <div className="flex flex-col gap-5 h-full min-h-0">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight text-balance">
                        {language === 'vi' ? "Bảng Kế Hoạch" : "Active Plan"}
                    </h2>
                    {currentRecipe && (
                        <span className="text-xs px-2 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
                            {language === 'vi' ? "Đang nấu" : "Cooking Mode"}
                        </span>
                    )}
                </div>

                <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-glass)]/50 backdrop-blur-xl shadow-lg">
                    {/* Empty State */}
                    {!currentRecipe && ingredients.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <div className="w-20 h-20 mb-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-4xl shadow-inner">
                                🍳
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                                {language === 'vi' ? "Chưa có kế hoạch" : "No Active Plan"}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                                {language === 'vi'
                                    ? "Trò chuyện với AI để lên thực đơn hoặc tìm công thức nấu ăn ngon."
                                    : "Chat with AI to generate a meal plan or find delicious recipes."}
                            </p>
                        </div>
                    )}

                    {/* Recipe Card */}
                    {currentRecipe && (
                        <div className="shrink-0 mb-6 p-5 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-subtle)] shadow-sm group hover:border-[var(--accent-primary)] transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-bl-full -mr-4 -mt-4 transition-transform duration-300 group-hover:scale-110" />

                            <div className="flex items-start gap-4 relative z-10">
                                <div className="text-4xl bg-[var(--background)] p-3 rounded-xl shadow-sm ring-1 ring-[var(--border-subtle)]">
                                    {currentRecipe.image}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">
                                        {currentRecipe.title[language]}
                                    </h3>
                                    <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                                        <span className="flex items-center gap-1 bg-[var(--background)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                                            ⏱️ {currentRecipe.time[language]}
                                        </span>
                                        <span className="flex items-center gap-1 bg-[var(--background)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                                            🔥 {currentRecipe.calories} kcal
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ingredients List */}
                    {ingredients.length > 0 && (
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                                    {language === 'vi' ? "Nguyên Liệu Cần Thiết" : "Required Ingredients"}
                                </h3>
                                <span className="text-xs text-[var(--text-muted)] font-mono">
                                    {ingredients.filter(i => i.status === 'found').length}/{ingredients.length}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {ingredients.map((ing, i) => (
                                    <IngredientRow
                                        key={i}
                                        name={ing.name}
                                        source={ing.source}
                                        price={ing.price}
                                        status={ing.status}
                                    />
                                ))}
                            </div>

                            {/* Total & Action */}
                            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] -mx-6 -mb-6 p-6">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                                            {language === 'vi' ? "Tổng cộng" : "Total Estimated"}
                                        </p>
                                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                                            {calculateTotal()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[var(--status-success)] flex items-center gap-1 justify-end">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
                                            {language === 'vi' ? "Đã bao gồm thuế" : "Tax included"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOrder}
                                    className="w-full py-4 bg-[var(--text-primary)] text-[var(--background)] font-bold rounded-xl hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-300 shadow-lg shadow-[var(--accent-glow)] active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>{language === 'vi' ? "Đặt Hàng Ngay" : "Order Ingredients"}</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
