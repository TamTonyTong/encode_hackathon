"use client";

import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";

interface PantryItem {
    id: string;
    name: string;
    category: string;
    quantity: string;
    expiry?: string;
}

export default function PantryPage() {
    const { language } = useLanguage();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [items, setItems] = useState<PantryItem[]>([
        { id: "1", name: "Rice", category: "Grains", quantity: "2 kg" },
        { id: "2", name: "Olive Oil", category: "Oils", quantity: "500 ml" },
        { id: "3", name: "Pasta", category: "Grains", quantity: "3 boxes" },
        { id: "4", name: "Tomatoes", category: "Vegetables", quantity: "5 pcs" },
        { id: "5", name: "Chicken Breast", category: "Meat", quantity: "500g", expiry: "2 days" },
    ]);

    const categories = ["All", "Vegetables", "Meet", "Grains", "Oils", "Spices"];
    const [activeCategory, setActiveCategory] = useState("All");

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        const newItem: PantryItem = {
            id: Date.now().toString(),
            name: newItemName,
            category: "Uncategorized",
            quantity: "1 unit"
        };

        setItems([newItem, ...items]);
        setNewItemName("");
        showToast(language === 'vi' ? "Đã thêm vào tủ bếp" : "Added to pantry", "success");
    };

    const handleDelete = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        showToast(language === 'vi' ? "Đã xóa" : "Item removed", "neutral");
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-6">
            <div className="flex items-center justify-between shrink-0 px-1">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                        {language === 'vi' ? "Tủ Bếp Của Tôi" : "My Pantry"}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {language === 'vi' ? "Quản lý nguyên liệu có sẵn" : "Manage available ingredients"}
                    </p>
                </div>
                <div className="bg-[var(--bg-surface)] px-3 py-1 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] font-mono">
                    {items.length} {language === 'vi' ? "món" : "items"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Column: List & Controls */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full glass-panel rounded-2xl p-6 border border-[var(--border-subtle)] bg-[var(--bg-glass)]/50 backdrop-blur-xl">

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                        {/* Search and Add */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={language === 'vi' ? "Tìm kiếm..." : "Search ingredients..."}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                />
                            </div>
                            <form onSubmit={handleAddItem} className="flex gap-2 flex-1">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder={language === 'vi' ? "Thêm món mới..." : "Add new item..."}
                                    className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newItemName}
                                    className="p-3 bg-[var(--text-primary)] text-[var(--background)] rounded-xl hover:bg-[var(--accent-primary)] transition-colors disabled:opacity-50"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                            </form>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar text-xs">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeCategory === cat
                                            ? "bg-[var(--accent-primary)] text-white font-medium"
                                            : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar mt-2">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                                <div className="text-4xl mb-2">🥥</div>
                                <p className="text-sm text-[var(--text-muted)]">No items found</p>
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center text-lg border border-[var(--border-subtle)]">
                                            {item.category === 'Vegetables' ? '🥬' :
                                                item.category === 'Meat' ? '🥩' :
                                                    item.category === 'Grains' ? '🌾' :
                                                        item.category === 'Oils' ? '🫒' : '📦'}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-[var(--text-primary)] text-sm">{item.name}</h3>
                                            <p className="text-xs text-[var(--text-muted)] inline-flex gap-2">
                                                <span>{item.quantity}</span>
                                                {item.expiry && (
                                                    <span className="text-[var(--status-error)] flex items-center gap-1">
                                                        • Expires in {item.expiry}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-[var(--status-error)] hover:text-white text-[var(--text-muted)] rounded-lg transition-colors"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Suggestions / Stats */}
                <div className="flex flex-col gap-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary)]/80 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl leading-none font-bold">5</div>
                        <h3 className="text-lg font-bold mb-1">{language === 'vi' ? "Sắp hết hạn" : "Expiring Soon"}</h3>
                        <p className="text-white/80 text-sm mb-4">
                            {language === 'vi' ? "Bạn có 5 món cần dùng ngay" : "You have items expiring this week"}
                        </p>
                        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-xs font-semibold transition-colors">
                            {language === 'vi' ? "Xem Gợi Ý Nấu Ăn" : "View Recipes"}
                        </button>
                    </div>

                    {/* Shopping List Teaser */}
                    <div className="flex-1 glass-panel rounded-2xl p-6 border border-[var(--border-subtle)] flex flex-col">
                        <h3 className="font-bold text-[var(--text-primary)] mb-4">{language === 'vi' ? "Cần Mua Thêm" : "Running Low"}</h3>
                        <div className="space-y-3 flex-1">
                            {["Milk", "Bread", "Eggs"].map(item => (
                                <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] opacity-70">
                                    <span className="text-sm text-[var(--text-primary)]">{item}</span>
                                    <button className="text-[var(--accent-primary)] text-xs hover:underline">
                                        + Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
