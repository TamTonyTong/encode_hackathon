
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: {
        "grocery.title": "Grocery & Market",
        "grocery.subtitle": "Smart sourcing from local vendors.",
        "grocery.distance": "Max Distance",
        "grocery.plan": "Your Plan",
        "grocery.deals": "Top Deals This Week",
        "grocery.save": "SAVE",
        "grocery.avg": "Avg",
        "grocery.list": "Shopping List",
        "grocery.recipe_ingredients": "Recipe Ingredients",
        "grocery.clear_filter": "Clear Filter",
        "grocery.no_items": "No items found within",
        "grocery.expand_search": "Expand Search Radius",
        "grocery.best_price": "Best Price",
        "grocery.available_at": "Available at",
        "grocery.away": "away",
        "grocery.best_deal": "Best Deal",
        "grocery.view_all": "View All",
        "grocery.ingredients_for": "Ingredients: "
    },
    vi: {
        "grocery.title": "Đi Chợ Online",
        "grocery.subtitle": "Tìm kiếm giá tốt nhất từ các chợ & siêu thị gần bạn.",
        "grocery.distance": "Khoảng Cách",
        "grocery.plan": "Món Ăn Gợi Ý",
        "grocery.deals": "Ưu Đãi Hôm Nay",
        "grocery.save": "GIẢM",
        "grocery.avg": "TB",
        "grocery.list": "Danh Sách Cần Mua",
        "grocery.recipe_ingredients": "Nguyên Liệu",
        "grocery.clear_filter": "Xem Tất Cả",
        "grocery.no_items": "Không tìm thấy sản phẩm nào trong bán kính",
        "grocery.expand_search": "Mở Rộng Tìm Kiếm",
        "grocery.best_price": "Giá Tốt Nhất",
        "grocery.available_at": "Nơi Bán",
        "grocery.away": "cách",
        "grocery.best_deal": "Giá Tốt",
        "grocery.view_all": "Xem Tất Cả",
        "grocery.ingredients_for": "Nguyên Liệu: "
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('vi'); // Default to Vietnamese

    const t = (key: string) => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
