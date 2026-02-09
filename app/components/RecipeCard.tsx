
"use client";

import { useState } from "react";
import { Recipe } from "../lib/mockData";
import { useLanguage } from "../context/LanguageContext";

export default function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
    const { language } = useLanguage();
    const [isFavorited, setIsFavorited] = useState(false);

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
    };

    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-video bg-[var(--bg-surface)] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                {recipe.image}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-transparent to-transparent opacity-90" />
            
            <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-glass)]/70 backdrop-blur-sm rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                <span className={`text-lg transition-transform duration-200 ${isFavorited ? "scale-110" : ""}`}>
                    {isFavorited ? "❤️" : "🤍"}
                </span>
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors duration-200 text-balance">
                    {recipe.title[language]}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">⏱️ {recipe.time[language]}</span>
                    <span className="flex items-center gap-1">🔥 {recipe.calories} kcal</span>
                </div>
            </div>
        </div>
    );
}
