import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  language: 'en' | 'vi';
}

interface ChatResponse {
  reply: string;
  recipe?: {
    id: string;
    title: { en: string; vi: string };
    time: { en: string; vi: string };
    calories: number;
    image: string;
    ingredients: {
      name: { en: string; vi: string };
      amount: string;
    }[];
    steps: { en: string; vi: string }[];
  };
}

// The featured recipe: Gà xào xả ớt (Lemongrass Chili Chicken)
const GA_XAO_XA_OT = {
  id: "ga-xao-xa-ot",
  title: { 
    en: "Lemongrass Chili Chicken", 
    vi: "Gà Xào Xả Ớt" 
  },
  time: { en: "30 mins", vi: "30 phút" },
  calories: 420,
  image: "🍗",
  ingredients: [
    { name: { en: "Chicken thigh (500g)", vi: "Đùi gà (500g)" }, amount: "500g" },
    { name: { en: "Lemongrass", vi: "Xả" }, amount: "3 cây" },
    { name: { en: "Chili", vi: "Ớt" }, amount: "2-3 quả" },
    { name: { en: "Garlic", vi: "Tỏi" }, amount: "5 tép" },
    { name: { en: "Fish sauce", vi: "Nước mắm" }, amount: "2 tbsp" },
    { name: { en: "Sugar", vi: "Đường" }, amount: "1 tbsp" },
    { name: { en: "Cooking oil", vi: "Dầu ăn" }, amount: "3 tbsp" },
  ],
  steps: [
    { en: "Cut chicken into bite-sized pieces, marinate with fish sauce and sugar for 15 mins", vi: "Cắt gà thành miếng vừa ăn, ướp với nước mắm và đường 15 phút" },
    { en: "Mince lemongrass and chili finely", vi: "Băm nhỏ xả và ớt" },
    { en: "Heat oil, fry garlic until fragrant", vi: "Đun nóng dầu, phi thơm tỏi" },
    { en: "Add chicken, stir-fry until golden", vi: "Cho gà vào xào vàng đều" },
    { en: "Add lemongrass and chili, stir-fry for 5 more minutes", vi: "Thêm xả và ớt, xào thêm 5 phút" },
    { en: "Season to taste and serve hot with rice", vi: "Nêm nếm vừa ăn, dọn nóng với cơm" },
  ]
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, language } = body;
    
    // TODO: Replace with actual AI (OpenAI/Gemini) call
    // For now, simulate intelligent responses
    
    const lowerMessage = message.toLowerCase();
    let reply: string;
    let recipe = undefined;
    
    // Check for recipe-related keywords
    if (lowerMessage.includes('recipe') || lowerMessage.includes('món') || 
        lowerMessage.includes('cook') || lowerMessage.includes('nấu') ||
        lowerMessage.includes('chicken') || lowerMessage.includes('gà') ||
        lowerMessage.includes('food') || lowerMessage.includes('ăn') ||
        lowerMessage.includes('suggest') || lowerMessage.includes('gợi ý') ||
        lowerMessage.includes('hungry') || lowerMessage.includes('đói')) {
      
      recipe = GA_XAO_XA_OT;
      
      if (language === 'vi') {
        reply = `Tuyệt vời! Tôi gợi ý cho bạn món **${recipe.title.vi}** - một món ăn đậm đà hương vị Việt Nam! 🍗\n\nMón này cần ${recipe.ingredients.length} nguyên liệu chính và chỉ mất khoảng ${recipe.time.vi}. Đây là công thức chi tiết để bạn nấu ngay!`;
      } else {
        reply = `Great choice! I recommend **${recipe.title.en}** - a delicious Vietnamese classic! 🍗\n\nThis dish needs ${recipe.ingredients.length} key ingredients and only takes about ${recipe.time.en}. Here's the detailed recipe for you!`;
      }
    } 
    // Greeting
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
             lowerMessage.includes('xin chào') || lowerMessage.includes('chào')) {
      reply = language === 'vi' 
        ? "Xin chào! Tôi là Aura AI, trợ lý nấu ăn của bạn. Hãy cho tôi biết bạn muốn nấu gì hôm nay? 🍳" 
        : "Hello! I'm Aura AI, your cooking assistant. What would you like to cook today? 🍳";
    }
    // Help
    else if (lowerMessage.includes('help') || lowerMessage.includes('giúp')) {
      reply = language === 'vi'
        ? "Tôi có thể giúp bạn:\n• Gợi ý công thức nấu ăn\n• Tìm nguyên liệu với giá tốt nhất\n• Lên kế hoạch bữa ăn hàng tuần\n\nHãy thử hỏi: 'Gợi ý món gà ngon đi!'"
        : "I can help you:\n• Suggest recipes\n• Find ingredients at the best prices\n• Plan weekly meals\n\nTry asking: 'Suggest a delicious chicken recipe!'";
    }
    // Default response - still offer the recipe
    else {
      recipe = GA_XAO_XA_OT;
      reply = language === 'vi'
        ? `Tôi hiểu! Dựa trên yêu cầu của bạn, tôi gợi ý món **${recipe.title.vi}** - rất dễ nấu và ngon tuyệt! 🌶️`
        : `I understand! Based on your request, I suggest **${recipe.title.en}** - easy to make and absolutely delicious! 🌶️`;
    }
    
    const response: ChatResponse = {
      reply,
      recipe
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
