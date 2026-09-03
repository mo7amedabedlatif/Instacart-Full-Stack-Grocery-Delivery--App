import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Home, Search, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "../types";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import api from "../config/api";

const SearchResults = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const fetchResults = useCallback(async (signal?: AbortSignal) => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/products?search=${encodeURIComponent(query)}`, {
        signal
      });

      if (data?.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') return;

      const errorMsg = err?.response?.data?.message || err?.message || "Failed to search";
      setError(errorMsg);
      toast.error(errorMsg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    const abortController = new AbortController();

    // Debounce the search (300ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchResults(abortController.signal);
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      abortController.abort();
    };
  }, [query, fetchResults]);

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">Search Results</span>
        </nav>

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-app-green mb-1">
            Results for "{query}"
          </h1>
          <p className="text-sm text-app-text-light">
            {loading ? "Searching..." : `${products.length} items found`}
          </p>
        </div>

        {/* Results */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 flex gap-4">
            <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Search Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-app-green mb-2">
              No results found
            </h2>
            <p className="text-sm text-app-text-light mb-6 max-w-md mx-auto">
              We couldn't find any products matching "{query}". Try a different
              search term.
            </p>
            <Link
              to="/products"
              className="inline-flex px-5 py-2.5 bg-app-green text-white text-sm font-medium rounded-lg hover:bg-app-green-light transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
