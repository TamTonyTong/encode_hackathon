import { NextRequest, NextResponse } from 'next/server';
import { PriceCompareRequest, PriceCompareResponse } from '@/app/types/api';
import { MOCK_ITEMS } from '@/app/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const body: PriceCompareRequest = await request.json();
    
    // TODO: Replace with actual price crawling service
    // Example:
    // const prices = await priceCrawler.fetchPrices({
    //   items: body.items,
    //   location: body.location,
    //   radius: body.maxDistanceKm
    // });
    
    // For now, filter mock data by distance
    const filteredItems = MOCK_ITEMS.map(item => {
      const availablePrices = item.prices.filter(
        p => p.distanceKm <= body.maxDistanceKm && p.inStock
      );
      
      return {
        ...item,
        prices: availablePrices
      };
    }).filter(item => item.prices.length > 0);
    
    // Calculate best deals (>10% cheaper than base price)
    const bestDeals = filteredItems
      .filter(item => {
        const minPrice = Math.min(...item.prices.map(p => p.priceVND));
        return minPrice < item.basePriceVND * 0.9;
      })
      .slice(0, 3);
    
    const response: PriceCompareResponse = {
      items: filteredItems,
      bestDeals
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Price comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare prices' },
      { status: 500 }
    );
  }
}
