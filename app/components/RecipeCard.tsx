
import { Recipe } from "../lib/mockData";
import { useLanguage } from "../context/LanguageContext";

export default function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
    const { language } = useLanguage();

    return (
        <div 
            onClick={onClick}
            className="group cursor-pointer relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300"
        >
            <div className="aspect-video bg-[var(--bg-surface)] flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
                {recipe.image}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-transparent to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">
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
