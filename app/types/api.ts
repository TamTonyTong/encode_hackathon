// Common types shared across API
export type Language = 'en' | 'vi';

// Recipe API Types
export interface RecipeGenerateRequest {
  ingredients?: string[];
  preferences?: {
    cuisine?: string;
    dietaryRestrictions?: string[];
    maxCalories?: number;
  };
  language: Language;
}

export interface RecipeGenerateResponse {
  recipes: Recipe[];
  totalCount: number;
}

export interface Recipe {
  id: string;
  title: { en: string; vi: string };
  time: { en: string; vi: string };
  calories: number;
  image: string;
  ingredients: string[];
}

// Price Comparison API Types
export interface PriceCompareRequest {
  items: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  maxDistanceKm: number;
  language: Language;
}

export interface PriceCompareResponse {
  items: GroceryItem[];
  bestDeals: GroceryItem[];
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

export interface PricePoint {
  storeName: { en: string; vi: string };
  logo: string;
  priceVND: number;
  priceUSD: number;
  distanceKm: number;
  inStock: boolean;
}

// Ingredient Analysis API Types
export interface IngredientAnalyzeRequest {
  image?: string;
  text?: string;
  language: Language;
}

export interface IngredientAnalyzeResponse {
  ingredients: string[];
  confidence: number;
}
