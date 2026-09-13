import { useState, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

interface AdvancedFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
  minPrice?: number;
  maxPrice?: number;
}

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  organic: boolean;
  inStock: boolean;
  onSale: boolean;
  rating: number;
}

const AdvancedFilter = ({
  onFilterChange,
  isOpen,
  onClose,
  minPrice = 0,
  maxPrice = 100,
}: AdvancedFilterProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    minPrice: minPrice,
    maxPrice: maxPrice,
    organic: false,
    inStock: true,
    onSale: false,
    rating: 0,
  });

  const handlePriceChange = useCallback(
    (type: "min" | "max", value: number) => {
      const newFilters = { ...filters };
      if (type === "min") {
        newFilters.minPrice = Math.min(value, filters.maxPrice);
      } else {
        newFilters.maxPrice = Math.max(value, filters.minPrice);
      }
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleToggle = useCallback(
    (key: keyof Omit<FilterOptions, "minPrice" | "maxPrice">) => {
      const newFilters = { ...filters, [key]: !filters[key] };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleRatingChange = useCallback(
    (rating: number) => {
      const newFilters = { ...filters, rating };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      minPrice,
      maxPrice,
      organic: false,
      inStock: true,
      onSale: false,
      rating: 0,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:static md:rounded-2xl md:border md:border-app-border max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-app-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-app-green">تصفية النتائج</h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-app-cream rounded-full transition-colors"
          >
            <X className="size-5 text-app-text-light" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-app-text">نطاق السعر</h3>
              <span className="text-sm font-medium text-app-green">
                ${filters.minPrice.toFixed(0)} - ${filters.maxPrice.toFixed(0)}
              </span>
            </div>

            {/* Price Sliders */}
            <div className="space-y-3">
              {/* Min Price */}
              <div>
                <label className="text-xs text-app-text-light block mb-2">
                  السعر الأدنى
                </label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.minPrice}
                  onChange={(e) =>
                    handlePriceChange("min", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-green"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="text-xs text-app-text-light block mb-2">
                  السعر الأعلى
                </label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handlePriceChange("max", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-green"
                />
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <h3 className="font-semibold text-app-text mb-3">الحالة</h3>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-app-cream transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={() => handleToggle("inStock")}
                className="w-4 h-4 text-app-green rounded"
              />
              <span className="text-sm text-app-text">
                ✓ منتجات في المخزن فقط
              </span>
            </label>
          </div>

          {/* Organic Filter */}
          <div>
            <h3 className="font-semibold text-app-text mb-3">النوع</h3>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-app-cream transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={filters.organic}
                onChange={() => handleToggle("organic")}
                className="w-4 h-4 text-app-green rounded"
              />
              <span className="text-sm text-app-text">
                🌱 منتجات عضوية
              </span>
            </label>
          </div>

          {/* Sale Filter */}
          <div>
            <h3 className="font-semibold text-app-text mb-3">العروض</h3>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-app-cream transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={() => handleToggle("onSale")}
                className="w-4 h-4 text-app-green rounded"
              />
              <span className="text-sm text-app-text">
                🔥 منتجات بعرض خاص
              </span>
            </label>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="font-semibold text-app-text mb-3">التقييم</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1, 0].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filters.rating === rating
                      ? "bg-app-green/10 border border-app-green"
                      : "hover:bg-app-cream"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-text">
                      {rating === 0 ? "جميع التقييمات" : `${rating}+ نجوم`}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < rating ? "⭐" : "☆"
                          }`}
                        >
                          {i < rating ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-app-border">
            <button
              onClick={handleReset}
              className="flex-1 py-2 text-app-green font-semibold border border-app-green rounded-lg hover:bg-app-cream transition-colors"
            >
              إعادة تعيين
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-app-green text-white font-semibold rounded-lg hover:bg-app-green-light transition-colors"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedFilter;
