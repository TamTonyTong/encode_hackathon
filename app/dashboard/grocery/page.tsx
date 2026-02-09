
"use client";

import { useState, useMemo } from "react";
import { ALL_ITEMS, MOCK_RECIPES, Recipe } from "../../lib/mockData";
import DistanceFilter from "../../components/crawling/DistanceFilter";
import PriceCard from "../../components/crawling/PriceCard";
import RecipeCard from "../../components/RecipeCard";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { useRecipes } from "../../context/RecipeContext";

export default function GroceryPage() {
    const [maxDistance, setMaxDistance] = useState(10);
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
    const { language, t } = useLanguage();
    const { generatedRecipes } = useRecipes();

    // Combine mock recipes with AI-generated recipes
    const allRecipes = useMemo(() => {
        // Convert AI recipes to mock recipe format
        const aiRecipes: Recipe[] = generatedRecipes.map(r => ({
            id: r.id,
            title: r.title,
            time: r.time,
            calories: r.calories,
            image: r.image,
            ingredients: r.ingredients.map((ing, idx) => `ai-${r.id}-${idx}`) // Generate placeholder IDs
        }));
        return [...aiRecipes.filter(ai => !MOCK_RECIPES.some(mock => mock.id === ai.id)), ...MOCK_RECIPES];
    }, [generatedRecipes]);

    // 1. Filter prices based on distance and calculate best price
    const processedItems = useMemo(() => {
        return ALL_ITEMS.map(item => {
            // Determine relevant price key based on language
            const priceKey = language === 'vi' ? 'priceVND' : 'priceUSD';
            const basePrice = language === 'vi' ? item.basePriceVND : item.basePriceUSD;

            // Filter available prices within range
            const availablePrices = item.prices.filter(p => p.distanceKm <= maxDistance && p.inStock);

            // Find best price
            const bestPrice = availablePrices.length > 0
                ? Math.min(...availablePrices.map(p => language === 'vi' ? p.priceVND : p.priceUSD))
                : 0;

            return {
                ...item,
                availablePrices,
                bestPrice,
                basePrice, // Normalized base price for current language
                hasAvailability: availablePrices.length > 0
            };
        }).filter(item => item.hasAvailability); // Only show items available within range
    }, [maxDistance, language]);

    // 2. Identify "Best Deals" (Items significantly cheaper than base price)
    const bestDeals = useMemo(() => {
        return processedItems
            .filter(item => item.bestPrice < item.basePrice * 0.9) // 10% cheaper than average
            .sort((a, b) => (a.bestPrice / a.basePrice) - (b.bestPrice / b.basePrice))
            .slice(0, 3);
    }, [processedItems]);

    const displayedItems = selectedRecipe
        ? processedItems.filter(item => allRecipes.find(r => r.id === selectedRecipe)?.ingredients.includes(item.id))
        : processedItems;

    const formatCurrency = (amount: number) => {
        return language === 'vi'
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
            : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] text-balance">{t("grocery.title")}</h1>
                        <LanguageToggle />
                    </div>
                    <p className="text-[var(--text-secondary)]">{t("grocery.subtitle")}</p>
                </div>
                <DistanceFilter value={maxDistance} onChange={setMaxDistance} />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                {/* Left Column: Recipes / Inspiration */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto scrollbar-gray pr-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] sticky top-0 bg-[var(--bg-void)]/95 backdrop-blur z-10 py-2">
                        {t("grocery.plan")}
                        {generatedRecipes.length > 0 && (
                            <span className="ml-2 text-xs bg-[var(--accent-primary)] text-black px-2 py-1 rounded-full">
                                +{generatedRecipes.length} AI
                            </span>
                        )}
                    </h2>
                    <div className="space-y-4">
                        {allRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Shopping List & Deals */}
                <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto scrollbar-gray pr-2 pb-10">

                    {/* Best Deals Section */}
                    {bestDeals.length > 0 && (
                        <section className="shrink-0">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">🔥</span>
                                <h2 className="text-xl font-bold text-[var(--accent-primary)]">{t("grocery.deals")}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bestDeals.map(item => (
                                    <div key={item.id} className="glass-panel p-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-[var(--accent-primary)] hover:border-[var(--border-hover)] transition-colors duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl">{item.image}</span>
                                            <span className="text-xs font-bold bg-[var(--accent-primary)] text-black px-2 py-1 rounded-full">
                                                {t("grocery.save")} {Math.round((1 - item.bestPrice / item.basePrice) * 100)}%
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-[var(--text-primary)] truncate text-balance">{item.name[language]}</h3>
                                        <p className="text-lg font-bold text-[var(--accent-primary)] mt-2">{formatCurrency(item.bestPrice)}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">{t("grocery.avg")}: {formatCurrency(item.basePrice)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Main List */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                {selectedRecipe
                                    ? `${t("grocery.ingredients_for")}${MOCK_RECIPES.find(r => r.id === selectedRecipe)?.title[language]}`
                                    : t("grocery.list")}
                            </h2>
                            {selectedRecipe && (
                                <button
                                    onClick={() => setSelectedRecipe(null)}
                                    className="text-xs text-[var(--accent-primary)] hover:underline"
                                >
                                    {t("grocery.view_all")}
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {displayedItems.length === 0 ? (
                                <div className="text-center py-10 text-[var(--text-secondary)] glass-panel rounded-xl">
                                    <p>{t("grocery.no_items")} {maxDistance}km.</p>
                                    <button
                                        onClick={() => setMaxDistance(20)}
                                        className="mt-2 text-[var(--accent-primary)] font-bold text-sm"
                                    >
                                        {t("grocery.expand_search")}
                                    </button>
                                </div>
                            ) : (
                                displayedItems.map(item => (
                                    <div key={item.id} className="glass-panel rounded-xl p-5 border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors duration-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-full flex items-center justify-center text-2xl">
                                                    {item.image}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-[var(--text-primary)]">{item.name[language]}</h3>
                                                    <p className="text-sm text-[var(--text-secondary)]">{item.category[language]}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xs text-[var(--text-muted)] mb-1">{t("grocery.best_price")}</span>
                                                <span className="text-xl font-bold text-[var(--accent-primary)]">
                                                    {formatCurrency(item.bestPrice)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price Comparisons */}
                                        <div className="space-y-2 bg-[var(--bg-void)]/30 rounded-lg p-3">
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-bold">{t("grocery.available_at")}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {item.availablePrices
                                                    .sort((a, b) => (language === 'vi' ? a.priceVND - b.priceVND : a.priceUSD - b.priceUSD))
                                                    .map((price, idx) => (
                                                        <PriceCard
                                                            key={`${item.id}-${price.storeName.en}`}
                                                            priceData={price}
                                                            bestPrice={item.bestPrice}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
