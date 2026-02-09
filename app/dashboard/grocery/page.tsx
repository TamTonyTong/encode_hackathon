
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ALL_ITEMS, MOCK_RECIPES, Recipe, GroceryItem } from "../../lib/mockData";
import DistanceFilter from "../../components/crawling/DistanceFilter";
import PriceCard from "../../components/crawling/PriceCard";
import RecipeCard from "../../components/RecipeCard";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { useRecipes } from "../../context/RecipeContext";

// Track item quantities and removed items
interface ItemQuantities {
    [itemId: string]: number;
}

export default function GroceryPage() {
    const router = useRouter();
    const [maxDistance, setMaxDistance] = useState(10);
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
    const { language, t } = useLanguage();
    const { generatedRecipes } = useRecipes();
    const [itemQuantities, setItemQuantities] = useState<ItemQuantities>({});
    const [removedItems, setRemovedItems] = useState<Set<string>>(new Set());
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Helper functions for item modification
    const getQuantity = (itemId: string) => itemQuantities[itemId] ?? 1;
    
    const updateQuantity = (itemId: string, delta: number) => {
        setItemQuantities(prev => {
            const newQty = Math.max(1, (prev[itemId] ?? 1) + delta);
            return { ...prev, [itemId]: newQty };
        });
    };

    const removeItem = (itemId: string) => {
        setRemovedItems(prev => new Set(prev).add(itemId));
    };

    const restoreItem = (itemId: string) => {
        setRemovedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
        });
    };

    const handleBuyAll = (itemCount: number, total: number) => {
        setShowConfirmation(true);
        // Redirect to progress page after a brief confirmation animation
        setTimeout(() => {
            router.push(`/dashboard/progress?items=${itemCount}&total=${total}`);
        }, 500);
    };

    // Helper to find matching grocery item
    const findMatchingItem = (nameEn: string, nameVi: string) => {
        return ALL_ITEMS.find(item => 
            item.name.en.toLowerCase().includes(nameEn.toLowerCase()) || 
            item.name.vi.toLowerCase().includes(nameVi.toLowerCase()) ||
            nameEn.toLowerCase().includes(item.name.en.toLowerCase()) ||
            nameVi.toLowerCase().includes(item.name.vi.toLowerCase())
        );
    };

    // Use memo to create virtual items for ingredients that don't match existing items
    const { allRecipes, virtualItems } = useMemo(() => {
        const newVirtualItems: GroceryItem[] = [];
        
        // Define available stores for random assignment
        const VIRTUAL_STORES = [
            { name: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, logo: "🟢" },
            { name: { en: "WinMart", vi: "WinMart" }, logo: "🔴" }
        ];
        
        const aiRecipes = generatedRecipes.map(r => {
            const recipeIngredients = r.ingredients.map((ing, idx) => {
                const existingItem = findMatchingItem(ing.name.en, ing.name.vi);
                
                if (existingItem) {
                    return existingItem.id;
                }

                // Create virtual item
                const virtualId = `ai-${r.id}-${idx}`;
                // Check if we already created this virtual item (deduplication)
                const existingVirtual = newVirtualItems.find(vi => vi.name.en === ing.name.en);
                if (existingVirtual) return existingVirtual.id;

                // Randomize Base Price (20k - 100k VND)
                const basePriceVND = Math.floor(Math.random() * (100000 - 20000 + 1) + 20000);
                const basePriceUSD = basePriceVND / 25000;

                // Randomize Store Availability (1 or both stores)
                const selectedStores = VIRTUAL_STORES.filter(() => Math.random() > 0.3);
                // Ensure at least one store
                if (selectedStores.length === 0) {
                    selectedStores.push(VIRTUAL_STORES[Math.floor(Math.random() * VIRTUAL_STORES.length)]);
                }

                const prices = selectedStores.map(store => {
                    // Price variance (+/- 15%)
                    const variance = 0.85 + Math.random() * 0.3;
                    const priceVND = Math.round(basePriceVND * variance / 1000) * 1000;
                    
                    return {
                        storeName: store.name,
                        logo: store.logo,
                        priceVND: priceVND,
                        priceUSD: parseFloat((priceVND / 25000).toFixed(2)),
                        distanceKm: parseFloat((1 + Math.random() * 9).toFixed(1)), // 1-10km
                        inStock: true
                    };
                });

                newVirtualItems.push({
                    id: virtualId,
                    name: ing.name,
                    category: { en: "AI Suggested", vi: "AI Gợi ý" },
                    image: "🥗", // Generic icon
                    basePriceVND: basePriceVND,
                    basePriceUSD: parseFloat(basePriceUSD.toFixed(2)),
                    prices: prices
                });
                return virtualId;
            });

            return {
                id: r.id,
                title: r.title,
                time: r.time,
                calories: r.calories,
                image: r.image,
                ingredients: recipeIngredients
            };
        });

        // Combine AI recipes with mock recipes, avoiding duplicates by ID if any
        const combinedRecipes = [
            ...aiRecipes.filter(ai => !MOCK_RECIPES.some(mock => mock.id === ai.id)),
            ...MOCK_RECIPES
        ];

        return { allRecipes: combinedRecipes, virtualItems: newVirtualItems };
    }, [generatedRecipes]);

    // Combine static items with virtual items
    const combinedItems = useMemo(() => [...ALL_ITEMS, ...virtualItems], [virtualItems]);

    // 1. Filter prices based on distance and calculate best price
    const processedItems = useMemo(() => {
        return combinedItems.map(item => {
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
    }, [combinedItems, maxDistance, language]);

    // 2. Identify "Best Deals" (Items significantly cheaper than base price)
    const bestDeals = useMemo(() => {
        return processedItems
            .filter(item => item.bestPrice < item.basePrice * 0.9) // 10% cheaper than average
            .sort((a, b) => (a.bestPrice / a.basePrice) - (b.bestPrice / b.basePrice))
            .slice(0, 3);
    }, [processedItems]);

    const displayedItems = (selectedRecipe
        ? processedItems.filter(item => allRecipes.find(r => r.id === selectedRecipe)?.ingredients.includes(item.id))
        : processedItems
    ).filter(item => !removedItems.has(item.id));

    // Calculate total price
    const totalPrice = useMemo(() => {
        return displayedItems.reduce((sum, item) => {
            return sum + (item.bestPrice * getQuantity(item.id));
        }, 0);
    }, [displayedItems, itemQuantities]);

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
                                            <div className="flex items-center gap-4">
                                                {/* Modification Controls */}
                                                <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-8 h-8 rounded-md bg-[var(--bg-void)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] font-bold transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={getQuantity(item.id)}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 1;
                                                            setItemQuantities(prev => ({ ...prev, [item.id]: Math.max(1, val) }));
                                                        }}
                                                        className="w-12 text-center font-bold text-[var(--text-primary)] bg-[var(--bg-void)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--accent-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-8 h-8 rounded-md bg-[var(--bg-void)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] font-bold transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title={language === 'vi' ? 'Xóa' : 'Remove'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                <div className="text-right">
                                                    <span className="block text-xs text-[var(--text-muted)] mb-1">{t("grocery.best_price")}</span>
                                                    <span className="text-xl font-bold text-[var(--accent-primary)]">
                                                        {formatCurrency(item.bestPrice * getQuantity(item.id))}
                                                    </span>
                                                </div>
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
                        {/* Removed Items (Undo Section) */}
                        {removedItems.size > 0 && (
                            <div className="mt-4 p-3 bg-[var(--bg-surface)]/50 rounded-lg border border-dashed border-[var(--border-subtle)]">
                                <p className="text-xs text-[var(--text-muted)] mb-2">
                                    {language === 'vi' ? 'Đã xóa:' : 'Removed:'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(removedItems).map(itemId => {
                                        const item = processedItems.find(i => i.id === itemId);
                                        if (!item) return null;
                                        return (
                                            <button
                                                key={itemId}
                                                onClick={() => restoreItem(itemId)}
                                                className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-void)] rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                                            >
                                                <span>{item.image}</span>
                                                <span>{item.name[language]}</span>
                                                <span className="text-[var(--accent-primary)]">↩</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Buy All Button */}
                    {displayedItems.length > 0 && (
                        <div className="sticky bottom-0 mt-6 p-4 glass-panel rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-void)]/95 backdrop-blur-lg">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {language === 'vi' ? 'Tổng cộng' : 'Total'} ({displayedItems.length} {language === 'vi' ? 'sản phẩm' : 'items'})
                                    </p>
                                    <p className="text-2xl font-bold text-[var(--accent-primary)]">
                                        {formatCurrency(totalPrice)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleBuyAll(displayedItems.length, totalPrice)}
                                    disabled={showConfirmation}
                                    className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                                        showConfirmation
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-black hover:scale-105 hover:shadow-lg hover:shadow-[var(--accent-primary)]/30'
                                    }`}
                                >
                                    {showConfirmation ? (
                                        <span className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {language === 'vi' ? 'Đã xác nhận!' : 'Confirmed!'}
                                        </span>
                                    ) : (
                                        language === 'vi' ? '🛒 Mua tất cả' : '🛒 Buy All'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
