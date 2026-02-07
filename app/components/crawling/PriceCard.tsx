
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
            flex items-center justify-between p-3 rounded-lg border transition-all duration-300
            ${isBestPrice 
                ? "bg-[var(--accent-glow)] border-[var(--accent-primary)]" 
                : "bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-80"}
        `}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-xl bg-black/20 rounded-full">
                    {priceData.logo}
                </div>
                <div>
                    <p className={`text-sm font-bold ${isBestPrice ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {priceData.storeName[language]}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {language === 'vi' ? `cách ${priceData.distanceKm}km` : `${priceData.distanceKm}km away`}
                    </p>
                </div>
            </div>
            
            <div className="text-right">
                <p className={`text-lg font-bold ${isBestPrice ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                    {formattedPrice}
                </p>
                {isBestPrice && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full">
                        {t("grocery.best_deal")}
                    </span>
                )}
            </div>
        </div>
    );
}
