
export interface PricePoint {
    storeName: { en: string; vi: string };
    logo: string;
    priceVND: number;
    priceUSD: number;
    distanceKm: number;
    inStock: boolean;
}

export interface GroceryItem {
    id: string;
    name: { en: string; vi: string };
    category: { en: string; vi: string };
    image: string;
    basePriceVND: number;
    basePriceUSD: number;
    prices: PricePoint[];
}

export interface Recipe {
    id: string;
    title: { en: string; vi: string };
    time: { en: string; vi: string };
    calories: number;
    image: string;
    ingredients: string[];
}

export const STORES = [
    { name: { en: "WinMart", vi: "WinMart" }, logo: "🔴" },
    { name: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, logo: "🟢" },
    { name: { en: "Co.opmart", vi: "Co.opmart" }, logo: "🔵" },
];

export const MOCK_ITEMS: GroceryItem[] = [
    {
        id: "thit-ba-chi",
        name: { en: "Pork Belly (500g)", vi: "Thịt Ba Chỉ (500g)" },
        category: { en: "Meat & Fish", vi: "Thịt & Cá" },
        image: "🥓",
        basePriceVND: 85000,
        basePriceUSD: 3.50,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 82000, 
                priceUSD: 3.30,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 95000, 
                priceUSD: 3.90,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "gao-st25",
        name: { en: "ST25 Rice (5kg)", vi: "Gạo ST25 (5kg)" },
        category: { en: "Rice & Dry Goods", vi: "Gạo & Đồ Khô" },
        image: "🌾",
        basePriceVND: 180000,
        basePriceUSD: 7.20,
        prices: [
            { 
                storeName: { en: "Co.opmart", vi: "Co.opmart" }, 
                logo: "🔵", 
                priceVND: 175000, 
                priceUSD: 7.00,
                distanceKm: 3.5, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 190000, 
                priceUSD: 7.60,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "ca-dieu-hong",
        name: { en: "Red Tilapia (1kg)", vi: "Cá Diêu Hồng (1kg)" },
        category: { en: "Meat & Fish", vi: "Thịt & Cá" },
        image: "🐟",
        basePriceVND: 65000,
        basePriceUSD: 2.60,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 60000, 
                priceUSD: 2.40,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "Co.opmart", vi: "Co.opmart" }, 
                logo: "🔵", 
                priceVND: 68000, 
                priceUSD: 2.75,
                distanceKm: 3.5, 
                inStock: true 
            },
        ]
    },
    {
        id: "rau-muong",
        name: { en: "Water Spinach (Bunch)", vi: "Rau Muống (1 bó)" },
        category: { en: "Vegetables", vi: "Rau Củ" },
        image: "🥬",
        basePriceVND: 10000,
        basePriceUSD: 0.40,
        prices: [
             { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 8000, 
                priceUSD: 0.32,
                distanceKm: 2.3, 
                inStock: true 
            },
             { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 12000, 
                priceUSD: 0.48,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "nuoc-mam",
        name: { en: "Nam Ngu Fish Sauce", vi: "Nước Mắm Nam Ngư" },
        category: { en: "Spices & Condiments", vi: "Gia Vị" },
        image: "🧂",
        basePriceVND: 42000,
        basePriceUSD: 1.70,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 38000, 
                priceUSD: 1.55,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 45000, 
                priceUSD: 1.80,
                distanceKm: 5.1, 
                inStock: true 
            },
            { 
                storeName: { en: "Co.opmart", vi: "Co.opmart" }, 
                logo: "🔵", 
                priceVND: 40000, 
                priceUSD: 1.60,
                distanceKm: 3.5, 
                inStock: true 
            },
        ]
    }
];

export const MOCK_RECIPES: Recipe[] = [
    {
        id: "ga-xao-xa-ot",
        title: { en: "Lemongrass Chili Chicken", vi: "Gà Xào Xả Ớt" },
        time: { en: "30 mins", vi: "30 phút" },
        calories: 420,
        image: "🍗",
        ingredients: ["dui-ga", "xa", "ot", "toi", "nuoc-mam"]
    },
    {
        id: "1",
        title: { en: "Braised Pork (Thit Kho Tau)", vi: "Thịt Kho Tàu" },
        time: { en: "45 mins", vi: "45 phút" },
        calories: 550,
        image: "🍲",
        ingredients: ["ba-roi-heo", "nuoc-mam"]
    },
    {
        id: "2",
        title: { en: "Sour Fish Soup (Canh Chua)", vi: "Canh Chua Cá" },
        time: { en: "30 mins", vi: "30 phút" },
        calories: 320,
        image: "🥣",
        ingredients: ["ca-dieu-hong", "rau-muong", "nuoc-mam"]
    },
    {
        id: "3",
        title: { en: "Family Meal", vi: "Cơm Gia Đình" },
        time: { en: "60 mins", vi: "60 phút" },
        calories: 700,
        image: "🍱",
        ingredients: ["gao-st25", "thit-ba-chi", "rau-muong"]
    }
];

// Additional ingredients for Gà Xào Xả Ớt
export const ADDITIONAL_ITEMS: GroceryItem[] = [
    {
        id: "dui-ga",
        name: { en: "Chicken Thigh (500g)", vi: "Đùi Gà (500g)" },
        category: { en: "Meat & Fish", vi: "Thịt & Cá" },
        image: "🍗",
        basePriceVND: 75000,
        basePriceUSD: 3.00,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 70000, 
                priceUSD: 2.80,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 85000, 
                priceUSD: 3.40,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "xa",
        name: { en: "Lemongrass (3 stalks)", vi: "Xả (3 cây)" },
        category: { en: "Spices & Condiments", vi: "Gia Vị" },
        image: "🌿",
        basePriceVND: 8000,
        basePriceUSD: 0.32,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 5000, 
                priceUSD: 0.20,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 8000, 
                priceUSD: 0.32,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "ot",
        name: { en: "Chili (3 pcs)", vi: "Ớt (3 quả)" },
        category: { en: "Spices & Condiments", vi: "Gia Vị" },
        image: "🌶️",
        basePriceVND: 5000,
        basePriceUSD: 0.20,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 3000, 
                priceUSD: 0.12,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 5000, 
                priceUSD: 0.20,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
    {
        id: "toi",
        name: { en: "Garlic (5 cloves)", vi: "Tỏi (5 tép)" },
        category: { en: "Spices & Condiments", vi: "Gia Vị" },
        image: "🧄",
        basePriceVND: 10000,
        basePriceUSD: 0.40,
        prices: [
            { 
                storeName: { en: "Bach Hoa Xanh", vi: "Bách Hóa Xanh" }, 
                logo: "🟢", 
                priceVND: 8000, 
                priceUSD: 0.32,
                distanceKm: 2.3, 
                inStock: true 
            },
            { 
                storeName: { en: "WinMart", vi: "WinMart" }, 
                logo: "🔴", 
                priceVND: 12000, 
                priceUSD: 0.48,
                distanceKm: 5.1, 
                inStock: true 
            },
        ]
    },
];

// Combined items list for use in components
export const ALL_ITEMS: GroceryItem[] = [...MOCK_ITEMS, ...ADDITIONAL_ITEMS];


