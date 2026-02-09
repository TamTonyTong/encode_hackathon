
"use client";

import { PricePoint } from "../../lib/mockData";
import { useLanguage } from "../../context/LanguageContext";

export default function PriceCard({ priceData, bestPrice }: { priceData: PricePoint, bestPrice: number }) {
    const { language, t } = useLanguage();
    
    // Choose the correct price based on language
    const currentPrice = language === 'vi' ? priceData.priceVND : priceData.priceUSD;
    const isBestPrice = currentPrice === bestPrice;
    
    // Format currency
    const formattedPrice = language === 'vi' 
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentPrice);

    return (
        <div className={`
            flex items-center justify-between p-3 rounded-lg border-l-4 border transition-all duration-200
            ${isBestPrice 
                ? "bg-[var(--accent-glow)] border-l-[var(--accent-primary)] border-[var(--border-hover)] shadow-md" 
                : "bg-[var(--bg-surface)] border-l-transparent border-[var(--border-subtle)] hover:border-[var(--border-hover)]"}
        `}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-xl bg-[var(--background)]/60 rounded-full border border-[var(--border-subtle)]">
                    {priceData.logo}
                </div>
                <div>
                    <p className={`text-sm font-bold transition-colors duration-200 ${isBestPrice ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {priceData.storeName[language]}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {language === 'vi' ? `cách ${priceData.distanceKm}km` : `${priceData.distanceKm}km away`}
                    </p>
                </div>
            </div>
            
            <div className="text-right">
                <p className={`text-lg font-bold transition-colors duration-200 ${isBestPrice ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                    {formattedPrice}
                </p>
                {isBestPrice && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 px-2 py-1 rounded-full block mt-1">
                        {t("grocery.best_deal")}
                    </span>
                )}
            </div>
        </div>
    );
}
