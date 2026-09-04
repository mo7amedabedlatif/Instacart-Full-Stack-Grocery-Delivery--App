import { useState, useEffect } from "react";
import { Star, ShoppingBag } from "lucide-react";
import api from "../config/api";
import type { Product } from "../types";
import ProductCard from "./ProductCard";

interface ProductRecommendationsProps {
  currentProductId: string;
  category?: string;
}

const ProductRecommendations = ({
  currentProductId,
  category,
}: ProductRecommendationsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const abortController = new AbortController();
        
        // Fetch products from same category
        let url = "/products";
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }

        const { data } = await api.get(url, {
          signal: abortController.signal,
        });

        if (data?.products && Array.isArray(data.products)) {
          // Filter out current product and get top 4
          const recommended = data.products
            .filter((p: Product) => p.id !== currentProductId)
            .slice(0, 4);

          setProducts(recommended);
        }

        return () => abortController.abort();
      } catch (error) {
        console.warn("Failed to load recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId, category]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="size-5 text-app-orange fill-app-orange" />
          <h2 className="text-xl font-bold text-app-green">يُنصح أيضاً</h2>
        </div>
        <p className="text-sm text-app-text-light">
          منتجات أخرى قد تعجبك من نفس الفئة
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="group">
            <ProductCard product={product} />
            
            {/* Add to Cart Button */}
            <button className="w-full mt-2 py-2 bg-app-green/10 text-app-green text-sm font-medium rounded-lg hover:bg-app-green hover:text-white transition-colors flex items-center justify-center gap-1">
              <ShoppingBag className="size-3" />
              أضف
            </button>
          </div>
        ))}
      </div>

      {/* Scroller Info for Mobile */}
      <div className="sm:hidden text-xs text-app-text-light text-center">
        👈 مرر بسهولة لترى المزيد
      </div>
    </div>
  );
};

export default ProductRecommendations;
