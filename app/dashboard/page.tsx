"use client";

import { useState } from "react";
import ImageUploader from "../components/ImageUploader";
import ChatInterface, { Message } from "../components/ChatInterface";
import IngredientRow from "../components/IngredientRow";
import { useToast } from "../context/ToastContext";

interface Ingredient {
    name: string;
    source: string;
    price: string;
    status: "searching" | "found" | "out_of_stock";
}

export default function DashboardPage() {
    const { showToast } = useToast();

    // State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Hello! Upload a photo of your ingredients or tell me what you're craving. I'll handle the rest." },
    ]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        // Initial empty state or maybe one example
        { name: "Sample Item", source: "Demo", price: "--", status: "searching" }
    ]);

    const handleOrder = () => {
        showToast("Processing order with providers...", "success");
    };

    const handleSendMessage = (text: string) => {
        setMessages(prev => [...prev, { role: "user", content: text }]);
        // Simple echo for now, main logic is in sample
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "ai", content: "I'm focusing on the fridge analysis right now. Check out the results!" }]);
        }, 1000);
    };

    const handleSample = () => {
        if (imageSrc) return; // Already loaded

        setImageSrc("/sample_fridge.png");
        showToast("Uploading sample image...", "neutral");

        // 1. Simulating Analysis Start
        setMessages(prev => [...prev, { role: "ai", content: "Great! Analyzing this fridge photo..." }]);

        // 2. Simulating Results (2s delay)
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "ai", content: "I found Avocado, Spinach, Eggs, and Greek Yogurt. I've updated your ingredient list." }]);

            setIngredients([
                { name: "Avocado (Hass)", source: "Whole Foods", price: "$1.50 ea", status: "found" },
                { name: "Organic Spinach", source: "Whole Foods", price: "$3.99", status: "found" },
                { name: "Large Brown Eggs", source: "Trader Joe's", price: "$4.99", status: "found" },
                { name: "Greek Yogurt (Plain)", source: "Trader Joe's", price: "$4.50", status: "found" },
                { name: "Bell Peppers", source: "Searching...", price: "--", status: "searching" }
            ]);

            showToast("Analysis Complete: 5 Items Found", "success");
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Input & Chat */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                {/* Image Uploader */}
                <div className="shrink-0">
                    <ImageUploader imageSrc={imageSrc} onSampleClick={handleSample} />
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-0">
                    <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
                </div>
            </div>

            {/* Right Column: Grocery/Ingredients */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Grocery List</h2>
                    <span className="px-2 py-1 rounded bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {ingredients.length} Items
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
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

                {/* Order Summary / Action */}
                <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                    <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="text-[var(--text-secondary)]">Estimated Total</span>
                        <span className="font-bold text-[var(--text-primary)]">$14.98</span>
                    </div>
                    <button
                        onClick={handleOrder}
                        className="w-full py-3 bg-[var(--text-primary)] text-black font-bold rounded-xl hover:bg-[var(--accent-primary)] transition-colors duration-300 shadow-lg shadow-white/5"
                    >
                        Find & Order All
                    </button>
                </div>
            </div>
        </div>
    );
}
