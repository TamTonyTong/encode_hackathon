
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
   
];

export const MOCK_RECIPES: Recipe[] = [
    // {
    //     id: "ga-xao-xa-ot",
    //     title: { en: "Lemongrass Chili Chicken", vi: "Gà Xào Xả Ớt" },
    //     time: { en: "30 mins", vi: "30 phút" },
    //     calories: 420,
    //     image: "🍗",
    //     ingredients: ["dui-ga", "xa", "ot", "toi", "nuoc-mam"]
    // }
];

// Combined items list for use in components
export const ALL_ITEMS: GroceryItem[] = [...MOCK_ITEMS];


