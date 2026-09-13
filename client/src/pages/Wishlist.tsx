import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import type { Product } from "../types";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Loading from "../components/Loading";
import api from "../config/api";

const Wishlist = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistProducts = useCallback(async () => {
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const abortController = new AbortController();
      
      // Fetch all products and filter by wishlist
      const { data } = await api.get("/products", {
        signal: abortController.signal,
      });

      const wishlistProducts = data.products.filter((p: Product) =>
        wishlist.some((w) => w.productId === p.id)
      );

      setProducts(wishlistProducts);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error("فشل تحميل المفضلات");
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    fetchWishlistProducts();
  }, [fetchWishlistProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`تم إضافة ${product.name} للسلة`, {
      icon: "🛒",
    });
  };

  const handleRemove = (product: Product) => {
    removeFromWishlist(product.id, product.name);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-app-cream py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm text-app-text-light hover:text-app-green transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            رجوع للتسوق
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="size-6 text-red-500 fill-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-app-green">المفضلات</h1>
          </div>
          <p className="text-app-text-light">
            لديك <span className="font-semibold text-app-green">{products.length}</span> منتج في قائمة المفضلات
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Heart className="size-20 text-app-border mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold text-app-text mb-2">لا توجد منتجات مفضلة</h2>
            <p className="text-app-text-light mb-6">
              ابدأ بإضافة منتجاتك المفضلة بالضغط على أيقونة القلب
            </p>
            <Link
              to="/products"
              className="inline-flex px-6 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors"
            >
              استكشف المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-app-border hover:border-app-green transition-colors group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-app-cream overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(product)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="إزالة من المفضلات"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Name */}
                  <h3 className="font-semibold text-app-green mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-bold text-app-green">
                      {currency}
                      {product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-app-text-light line-through">
                        {currency}
                        {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Badge */}
                  <div className="mb-3">
                    {product.stock > 5 ? (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        ✓ في المخزن
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        ⚠️ عدد محدود ({product.stock})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                        ✗ غير متوفر
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full py-2 bg-app-green text-white font-semibold rounded-lg hover:bg-app-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="size-4" />
                      أضف للسلة
                    </button>
                    <Link
                      to={`/products/${product.id}`}
                      className="w-full py-2 text-center border border-app-green text-app-green rounded-lg hover:bg-app-cream transition-colors text-sm font-medium"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {products.length > 0 && (
          <div className="mt-12 bg-app-green/5 border border-app-green/20 rounded-2xl p-6">
            <h3 className="font-semibold text-app-green mb-4">📊 إحصائيات المفضلات</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold text-app-green">{products.length}</p>
                <p className="text-sm text-app-text-light">منتج مفضل</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-app-green">
                  {currency}
                  {products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                </p>
                <p className="text-sm text-app-text-light">القيمة الإجمالية</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-app-green">
                  {Math.round(
                    (products.reduce((sum, p) => sum + (p.originalPrice ? p.originalPrice - p.price : 0), 0) /
                      products.reduce((sum, p) => sum + (p.originalPrice || p.price), 0)) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-app-text-light">متوسط الخصم</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
