"use client";

import ImageUploader from "../components/ImageUploader";
import ChatInterface from "../components/ChatInterface";
import IngredientRow from "../components/IngredientRow";

export default function DashboardPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Column: Input & Chat */}
            <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                {/* Image Uploader */}
                <div className="shrink-0">
                    <ImageUploader />
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-0">
                    <ChatInterface />
                </div>
            </div>

            {/* Right Column: Grocery/Ingredients */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Grocery List</h2>
                    <span className="px-2 py-1 rounded bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] border border-[var(--border-subtle)]">3 Items</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {/* Mock Data */}
                    <IngredientRow name="Organic Spinach" source="Whole Foods Market" price="$3.99" status="found" />
                    <IngredientRow name="Chicken Breast" source="Searching APIs..." price="--" status="searching" />
                    <IngredientRow name="Greek Yogurt" source="Trader Joe's" price="$4.50" status="found" />
                    <IngredientRow name="Chia Seeds" source="Not available nearby" price="--" status="out_of_stock" />
                </div>

                {/* Order Summary / Action */}
                <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                    <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="text-[var(--text-secondary)]">Estimated Total</span>
                        <span className="font-bold text-[var(--text-primary)]">$8.49</span>
                    </div>
                    <button className="w-full py-3 bg-[var(--text-primary)] text-black font-bold rounded-xl hover:bg-[var(--accent-primary)] transition-colors duration-300 shadow-lg shadow-white/5">
                        Find & Order All
                    </button>
                </div>
            </div>
        </div>
    );
}
