import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Home } from "lucide-react";

import type { Product } from "../types";
import { useWishlist } from "../context/WishlistContext";
import api from "../config/api";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";

const Favorites = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const abortController = new AbortController();
        
        // Fetch all products
        const { data } = await api.get("/products", {
          signal: abortController.signal
        });

        if (data?.products) {
          // Filter to only wishlist items
          const wishlistProducts = data.products.filter((product: Product) =>
            wishlist.some((item) => item.productId === product.id)
          );
          
          // Sort by date added (newest first)
          const sorted = wishlistProducts.sort((a: Product, b: Product) => {
            const aDate = wishlist.find((item) => item.productId === a.id)?.addedAt || 0;
            const bDate = wishlist.find((item) => item.productId === b.id)?.addedAt || 0;
            return bDate - aDate;
          });

          setProducts(sorted);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">المفضلات</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="size-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-app-green">المفضلات</h1>
          </div>
          <p className="text-sm text-app-text-light">
            {products.length > 0
              ? `لديك ${products.length} منتج في المفضلات`
              : "قائمة المفضلات فارغة"}
          </p>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-app-border">
            <Heart className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-app-green mb-2">
              قائمة المفضلات فارغة
            </h2>
            <p className="text-sm text-app-text-light mb-6 max-w-md mx-auto">
              أضف منتجاتك المفضلة هنا! انقر على أيقونة القلب على أي منتج لحفظه.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-green text-white font-medium rounded-xl hover:bg-app-green-light transition-colors"
            >
              <ShoppingBag className="size-5" />
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="إزالة من المفضلات"
                  >
                    <Heart className="size-4 fill-current" />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => navigate("/products")}
                className="flex-1 py-3 text-app-green font-semibold border-2 border-app-green rounded-xl hover:bg-app-cream transition-colors"
              >
                متابعة التسوق
              </button>
              <button
                onClick={() => {
                  // Add all to cart logic would go here
                  const itemIds = products.map((p) => p.id);
                  console.log("Add to cart:", itemIds);
                }}
                className="flex-1 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="size-5" />
                إضافة الكل للسلة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
