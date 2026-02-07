import { PriceCompareRequest, PriceCompareResponse } from '../types/api';

export class PriceService {
  private static baseUrl = '/api/prices';

  static async comparePrices(
    request: PriceCompareRequest
  ): Promise<PriceCompareResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Price service error:', error);
      throw error;
    }
  }
}
