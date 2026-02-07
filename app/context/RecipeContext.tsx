"use client";

import React, { createContext, useContext, useState } from 'react';
import { GeneratedRecipe } from '../services/chatService';

interface RecipeContextType {
    generatedRecipes: GeneratedRecipe[];
    addRecipe: (recipe: GeneratedRecipe) => void;
    clearRecipes: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
    const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);

    const addRecipe = (recipe: GeneratedRecipe) => {
        setGeneratedRecipes(prev => {
            // Avoid duplicates
            if (prev.some(r => r.id === recipe.id)) return prev;
            return [...prev, recipe];
        });
    };

    const clearRecipes = () => {
        setGeneratedRecipes([]);
    };

    return (
        <RecipeContext.Provider value={{ generatedRecipes, addRecipe, clearRecipes }}>
            {children}
        </RecipeContext.Provider>
    );
}

export function useRecipes() {
    const context = useContext(RecipeContext);
    if (context === undefined) {
        throw new Error('useRecipes must be used within a RecipeProvider');
    }
    return context;
}
