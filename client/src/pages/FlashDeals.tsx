import { useEffect, useState, useCallback } from "react";
import { Zap, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "../types";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api from "../config/api";

const FlashDeals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/products/flash-deals", { signal });
      
      if (data?.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError') return;
      
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to load deals";
      setError(errorMsg);
      toast.error(errorMsg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchDeals(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [fetchDeals]);

  return (
    <div className="min-h-screen bg-app-cream">
      {/* Banner */}
      <div className="bg-linear-to-r from-app-orange to-app-orange-dark text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex-center gap-2 mb-3">
            <Zap className="size-6 fill-white" />
            <h1 className="text-3xl font-semibold">Flash Deals</h1>
            <Zap className="size-6 fill-white" />
          </div>
          <p className="text-white/80 max-w-md mx-auto">
            Limited-time offers on your favorite organic products. Grab them
            before they're gone!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex gap-4">
            <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Failed to Load Deals</h3>
              <p className="text-sm text-red-800 mb-3">{error}</p>
              <button
                onClick={() => {
                  const abortController = new AbortController();
                  fetchDeals(abortController.signal);
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-app-green mb-2">
              No deals right now
            </h2>
            <p className="text-sm text-app-text-light">
              Check back soon for amazing offers!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(
              (product) =>
                product.stock > 0 && (
                  <ProductCard key={product.id} product={product} />
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashDeals;
