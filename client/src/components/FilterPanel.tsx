import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export interface CategoryItem {
  name: string;
  slug: string;
}

interface FilterPanelProps {
  categories: CategoryItem[];
  category: string;
  organic: string;
  minPrice: string;
  maxPrice: string;
  updateFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  disabled?: boolean;
}

const FilterPanel = ({
  categories,
  category,
  organic,
  minPrice,
  maxPrice,
  updateFilter,
  clearFilters,
  hasFilters,
  disabled = false,
}: FilterPanelProps) => {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const minPriceTimerRef = useRef<NodeJS.Timeout>();
  const maxPriceTimerRef = useRef<NodeJS.Timeout>();

  // Update local state when props change
  useEffect(() => {
    // Cancel any pending debounce
    if (minPriceTimerRef.current) {
      clearTimeout(minPriceTimerRef.current);
    }
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    // Cancel any pending debounce
    if (maxPriceTimerRef.current) {
      clearTimeout(maxPriceTimerRef.current);
    }
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  const handleMinPriceChange = (value: string) => {
    setLocalMinPrice(value);
    if (minPriceTimerRef.current) {
      clearTimeout(minPriceTimerRef.current);
    }
    minPriceTimerRef.current = setTimeout(() => {
      updateFilter("minPrice", value);
    }, 500);
  };

  const handleMaxPriceChange = (value: string) => {
    setLocalMaxPrice(value);
    if (maxPriceTimerRef.current) {
      clearTimeout(maxPriceTimerRef.current);
    }
    maxPriceTimerRef.current = setTimeout(() => {
      updateFilter("maxPrice", value);
    }, 500);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (minPriceTimerRef.current) clearTimeout(minPriceTimerRef.current);
      if (maxPriceTimerRef.current) clearTimeout(maxPriceTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-app-border">
        <div className="flex items-center gap-2 text-app-green font-bold text-base">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            disabled={disabled}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-app-green mb-3">Categories</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter("category", "")}
            disabled={disabled}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
              !category
                ? "bg-app-green text-white font-medium"
                : "text-app-text-light hover:bg-app-cream"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter("category", cat.slug)}
              disabled={disabled}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                category === cat.slug
                  ? "bg-app-green text-white font-medium"
                  : "text-app-text-light hover:bg-app-cream"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-app-green mb-3">Price Range ($)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-xl border border-app-border text-sm focus:border-app-green outline-none transition-colors disabled:opacity-50"
          />
          <span className="text-app-text-light text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-xl border border-app-border text-sm focus:border-app-green outline-none transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {/* Organic Filter */}
      <div>
        <h4 className="text-sm font-semibold text-app-green mb-3">Type</h4>
        <label className="flex items-center gap-2 text-sm text-app-text-light cursor-pointer select-none">
          <input
            type="checkbox"
            checked={organic === "true"}
            onChange={(e) => updateFilter("organic", e.target.checked ? "true" : "")}
            disabled={disabled}
            className="w-4 h-4 rounded text-app-green focus:ring-app-green border-app-border"
          />
          Organic Products Only
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
