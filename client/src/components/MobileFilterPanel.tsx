import { useState } from "react";
import { X, ChevronDown, Sliders } from "lucide-react";

interface FilterPanelProps {
  onPriceChange: (min: number, max: number) => void;
  onCategoryChange: (category: string) => void;
  onOrganicChange: (organic: boolean) => void;
  currentPrice: { min: number; max: number };
  currentCategory: string;
  currentOrganic: boolean;
}

const MobileFilterPanel = ({
  onPriceChange,
  onCategoryChange,
  onOrganicChange,
  currentPrice,
  currentCategory,
  currentOrganic,
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("price");
  const [localPrice, setLocalPrice] = useState(currentPrice);

  const categories = [
    { id: "fruits", label: "🍎 الفواكه", color: "bg-red-50" },
    { id: "vegetables", label: "🥕 الخضار", color: "bg-green-50" },
    { id: "dairy", label: "🥛 منتجات ألبان", color: "bg-yellow-50" },
    { id: "bakery", label: "🍞 المخبوزات", color: "bg-orange-50" },
  ];

  const handlePriceApply = () => {
    onPriceChange(localPrice.min, localPrice.max);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 bg-app-green text-white rounded-full shadow-lg hover:bg-app-green-light transition-colors z-40 md:hidden flex items-center justify-center"
      >
        <Sliders className="size-6" />
        <span className="sr-only">فتح الفلاتر</span>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 md:hidden max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-app-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-app-green">الفلاتر</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-app-cream rounded-lg transition-colors"
          >
            <X className="size-6 text-app-text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Price Range */}
          <div className="space-y-3">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "price" ? "" : "price"
                )
              }
              className="w-full flex items-center justify-between p-3 hover:bg-app-cream rounded-xl transition-colors"
            >
              <span className="font-semibold text-app-green">النطاق السعري</span>
              <ChevronDown
                className={`size-5 transition-transform ${
                  expandedSection === "price" ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "price" && (
              <div className="space-y-4 px-3">
                {/* Visual Range Slider */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <span className="text-xs text-app-text-light block mb-1">
                        الحد الأدنى
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localPrice.min}
                        onChange={(e) =>
                          setLocalPrice({
                            ...localPrice,
                            min: Math.min(
                              parseInt(e.target.value),
                              localPrice.max
                            ),
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-sm font-semibold text-app-green">
                        ${localPrice.min}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <span className="text-xs text-app-text-light block mb-1">
                        الحد الأقصى
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={localPrice.max}
                        onChange={(e) =>
                          setLocalPrice({
                            ...localPrice,
                            max: Math.max(
                              parseInt(e.target.value),
                              localPrice.min
                            ),
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-sm font-semibold text-app-green">
                        ${localPrice.max}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={handlePriceApply}
                  className="w-full py-2 bg-app-green text-white text-sm font-medium rounded-lg hover:bg-app-green-light transition-colors"
                >
                  تطبيق
                </button>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-3 border-t border-app-border pt-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "category" ? "" : "category"
                )
              }
              className="w-full flex items-center justify-between p-3 hover:bg-app-cream rounded-xl transition-colors"
            >
              <span className="font-semibold text-app-green">الفئة</span>
              <ChevronDown
                className={`size-5 transition-transform ${
                  expandedSection === "category" ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "category" && (
              <div className="grid grid-cols-2 gap-2 px-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      currentCategory === cat.id
                        ? "bg-app-green text-white"
                        : `${cat.color} text-app-text hover:opacity-80`
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Organic */}
          <div className="space-y-3 border-t border-app-border pt-4">
            <label className="p-3 hover:bg-app-cream rounded-xl transition-colors flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={currentOrganic}
                onChange={(e) => onOrganicChange(e.target.checked)}
                className="size-5 text-app-green rounded cursor-pointer"
              />
              <span className="flex-1 font-medium text-app-green">
                🌱 منتجات عضوية فقط
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-app-border p-6 space-y-2">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors"
          >
            تطبيق الفلاتر
          </button>
          <button
            onClick={() => {
              onPriceChange(0, 100);
              onCategoryChange("");
              onOrganicChange(false);
            }}
            className="w-full py-3 text-app-green font-semibold border-2 border-app-green rounded-xl hover:bg-app-cream transition-colors"
          >
            إعادة تعيين
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterPanel;
