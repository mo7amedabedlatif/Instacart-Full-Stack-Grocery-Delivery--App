import { useMemo } from 'react';
export const useSmartRecommendations = (products, currentProduct, userPreferences) => {
  return useMemo(() => {
    if (!products?.length) return [];
    const scored = products
      .filter(p => p.id !== currentProduct?.id)
      .map(product => {
        let score = 0;
        const reasons = [];
        
        if (product.rating >= 4.8) score += 10, reasons.push('⭐ ممتاز');
        else if (product.rating >= 4.5) score += 8, reasons.push('⭐ عالي');
        else if (product.rating >= 4.0) score += 5, reasons.push('⭐ جيد');
        
        if (product.originalPrice) {
          const disc = ((product.originalPrice - product.price) / product.originalPrice) * 100;
          if (disc >= 40) score += 8, reasons.push(`🔥 ${Math.round(disc)}%`);
          else if (disc >= 25) score += 6, reasons.push(`🔥 ${Math.round(disc)}%`);
        }
        
        if (product.stock > 20) score += 6, reasons.push('✓ متوفر');
        else if (product.stock > 0) score += 2, reasons.push('⚠️ محدود');
        
        return { product, score, reasons };
      });
    
    return scored.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [products, currentProduct, userPreferences]);
};
