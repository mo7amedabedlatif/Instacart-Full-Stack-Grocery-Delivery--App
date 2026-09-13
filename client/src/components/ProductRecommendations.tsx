import { useEffect, useState } from "react";
import { Zap, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "../types";
import ProductCard from "./ProductCard";
import Loading from "./Loading";
import api from "../config/api";

interface ProductRecommendationsProps {
  currentProductId?: string;
  title?: string;
  showTitle?: boolean;
}

const ProductRecommendations = ({
  currentProductId,
  title = "منتجات قد تنال إعجابك",
  showTitle = true,
}: ProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const abortController = new AbortController();

        // Fetch products
        const { data } = await api.get("/products", {
          signal: abortController.signal,
        });

        if (!data?.products) {
          setRecommendations([]);
          return;
        }

        let filtered = data.products;

        // Remove current product
        if (currentProductId) {
          filtered = filtered.filter((p: Product) => p.id !== currentProductId);
        }

        // Get personalized recommendations
        // 1. Try to find trending products (high rating)
        const trendingProducts = filtered
          .filter((p: Product) => p.rating >= 4.5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // 2. Add discounted products
        const discountedProducts = filtered
          .filter((p: Product) => p.originalPrice && p.originalPrice > p.price)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);

        // 3. Add in-stock products
        const inStockProducts = filtered
          .filter((p: Product) => p.stock > 5)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Combine and deduplicate
        const combined = [
          ...trendingProducts,
          ...discountedProducts,
          ...inStockProducts,
        ];
        const unique = Array.from(
          new Map(combined.map((item) => [item.id, item])).values()
        ).slice(0, 6);

        setRecommendations(unique);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch recommendations:", error);
          setRecommendations([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) return <Loading />;

  if (recommendations.length === 0) return null;

  return (
    <section className="py-8">
      {/* Header */}
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 bg-app-orange/10 rounded-full flex items-center justify-center">
              <Zap className="size-5 text-app-orange" />
            </div>
            <h2 className="text-2xl font-bold text-app-green">{title}</h2>
          </div>
          <p className="text-sm text-app-text-light">
            اختيارنا الأفضل بناءً على تقييمات المستخدمين والعروض الحالية
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />

            {/* Badge */}
            {product.rating >= 4.5 && (
              <div className="absolute top-2 left-2 bg-app-orange text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="size-3" />
                الأفضل
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-app-green/5 border border-app-green/20 rounded-2xl p-6">
        <p className="text-sm text-app-text-light">
          💡 <span className="font-semibold">نصيحة:</span> المنتجات الموصى بها
          تم اختيارها بناءً على:
        </p>
        <ul className="text-xs text-app-text-light mt-3 space-y-1">
          <li>✓ تقييمات عالية من المستخدمين</li>
          <li>✓ عروض حالية وخصومات</li>
          <li>✓ توفر المخزون والتوصيل السريع</li>
        </ul>
      </div>
    </section>
  );
};

export default ProductRecommendations;
