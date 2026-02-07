# API Integration Guide

This document explains how to integrate real AI services into the existing API architecture.

## Architecture Overview

```
┌─────────────────┐
│  UI Components  │
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  (Client-side)
│  - RecipeService│
│  - PriceService │
└────────┬────────┘
         │
┌────────▼────────┐
│   API Routes    │  (Server-side)
│  - /api/recipes │
│  - /api/prices  │
└────────┬────────┘
         │
┌────────▼────────┐
│  AI Services /  │  (External)
│  Web Scrapers   │
└─────────────────┘
```

## API Endpoints

### 1. Recipe Generation: `POST /api/recipes/generate`

**Current Status**: Returns filtered mock data  
**Future Integration**: OpenAI/Gemini for recipe generation

**Request Example**:
```json
{
  "ingredients": ["thit-ba-chi", "gao-st25"],
  "preferences": {
    "cuisine": "Vietnamese",
    "maxCalories": 600
  },
  "language": "vi"
}
```

**Integration Steps**:

1. **Install OpenAI SDK**:
```bash
npm install openai
```

2. **Update `app/api/recipes/generate/route.ts`**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  const body: RecipeGenerateRequest = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "You are a Vietnamese cooking expert. Generate recipes in JSON format."
    }, {
      role: "user",
      content: `Generate 3 ${body.language === 'vi' ? 'Vietnamese' : 'international'} recipes using: ${body.ingredients?.join(', ')}. Max calories: ${body.preferences?.maxCalories}`
    }],
    response_format: { type: "json_object" }
  });
  
  const generatedRecipes = JSON.parse(completion.choices[0].message.content);
  return NextResponse.json(generatedRecipes);
}
```

3. **Add Environment Variable** (`.env.local`):
```
OPENAI_API_KEY=sk-...
```

---

### 2. Price Comparison: `POST /api/prices/compare`

**Current Status**: Filters mock data by distance  
**Future Integration**: Web scraping service or price API

**Request Example**:
```json
{
  "items": ["thit-ba-chi", "gao-st25"],
  "location": { "latitude": 10.8231, "longitude": 106.6297 },
  "maxDistanceKm": 10,
  "language": "vi"
}
```

**Integration Options**:

**Option A: Web Scraping** (Puppeteer/Playwright)
```typescript
import { chromium } from 'playwright';

async function scrapePrices(itemName: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Example: Scrape Bach Hoa Xanh
  await page.goto(`https://www.bachhoaxanh.com/search?q=${itemName}`);
  const prices = await page.$$eval('.product-price', 
    elements => elements.map(el => el.textContent)
  );
  
  await browser.close();
  return prices;
}
```

**Option B: Third-party Price API**
```typescript
async function fetchPrices(itemName: string, location: Location) {
  const response = await fetch('https://price-api-service.com/compare', {
    method: 'POST',
    body: JSON.stringify({ item: itemName, location })
  });
  return response.json();
}
```

---

### 3. Ingredient Analysis: `POST /api/ingredients/analyze`

**Current Status**: Returns mock ingredients  
**Future Integration**: GPT-4 Vision or Google Vision AI

**Request Example**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "language": "vi"
}
```

**Integration Steps**:

1. **Update `app/api/ingredients/analyze/route.ts`**:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  const body: IngredientAnalyzeRequest = await request.json();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { 
          type: "text", 
          text: `List all food ingredients visible in this image. Return as JSON array in ${body.language === 'vi' ? 'Vietnamese' : 'English'}.`
        },
        { 
          type: "image_url", 
          image_url: { url: body.image }
        }
      ]
    }],
    max_tokens: 300
  });
  
  const ingredients = JSON.parse(response.choices[0].message.content);
  
  return NextResponse.json({
    ingredients: ingredients.items,
    confidence: 0.9
  });
}
```

---

## Testing the APIs

### Using curl:

**Test Recipe Generation**:
```bash
curl -X POST http://localhost:3000/api/recipes/generate \
  -H "Content-Type: application/json" \
  -d '{"ingredients":["thit-ba-chi"],"language":"vi"}'
```

**Test Price Comparison**:
```bash
curl -X POST http://localhost:3000/api/prices/compare \
  -H "Content-Type: application/json" \
  -d '{"items":["gao-st25"],"location":{"latitude":10.8,"longitude":106.6},"maxDistanceKm":10,"language":"vi"}'
```

### Using the UI:

The services are already integrated into the components. Just navigate to `/dashboard/grocery` and the data flows through the API architecture automatically.

---

## Environment Variables Needed

Create `.env.local` file:
```
# OpenAI (for AI recipe generation and image analysis)
OPENAI_API_KEY=sk-...

# Optional: Price scraping service
PRICE_API_KEY=...
PRICE_API_URL=https://...

# Optional: Google Vision (alternative to OpenAI vision)
GOOGLE_VISION_API_KEY=...
```

---

## Next Steps for Hackathon

1. **Demo with Mock Data**: Current implementation works perfectly for demo
2. **Partial AI Integration**: Replace just the recipe endpoint with real AI
3. **Full Integration**: Connect all endpoints to real services

The architecture is ready - you can swap mock data for real AI responses without changing any UI code!
