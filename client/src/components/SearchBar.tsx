import { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchSuggestion {
  text: string;
  type: "recent" | "trending" | "category";
  icon: React.ReactNode;
}

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const trendingSearches = [
    "عضوي",
    "خضروات طازة",
    "منتجات ألبان",
    "فواكه",
    "خبز",
    "حليب",
  ];

  const categories = [
    "الخضروات",
    "الفواكه",
    "الألبان",
    "المشروبات",
    "الحبوب",
    "اللحوم",
  ];

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem("app_search_history_v1");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([
        ...recentSearches.slice(0, 3).map((text) => ({
          text,
          type: "recent" as const,
          icon: <Clock className="size-4 text-app-text-light" />,
        })),
        ...trendingSearches.slice(0, 2).map((text) => ({
          text,
          type: "trending" as const,
          icon: <TrendingUp className="size-4 text-app-orange" />,
        })),
      ]);
      setShowSuggestions(true);
      return;
    }

    // Filter suggestions
    const filteredSuggestions: SearchSuggestion[] = [];

    // Recent searches
    const matchingRecent = recentSearches
      .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 2);
    filteredSuggestions.push(
      ...matchingRecent.map((text) => ({
        text,
        type: "recent" as const,
        icon: <Clock className="size-4 text-app-text-light" />,
      }))
    );

    // Categories
    const matchingCategories = categories
      .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 2);
    filteredSuggestions.push(
      ...matchingCategories.map((text) => ({
        text,
        type: "category" as const,
        icon: <Search className="size-4 text-app-green" />,
      }))
    );

    // Trending
    const matchingTrending = trendingSearches
      .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 1);
    filteredSuggestions.push(
      ...matchingTrending.map((text) => ({
        text,
        type: "trending" as const,
        icon: <TrendingUp className="size-4 text-app-orange" />,
      }))
    );

    setSuggestions(filteredSuggestions);
    setShowSuggestions(true);
  };

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // Save to recent searches
    const updated = [
      trimmedQuery,
      ...recentSearches.filter((s) => s !== trimmedQuery),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("app_search_history_v1", JSON.stringify(updated));

    // Navigate
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    handleSearch(text);
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("app_search_history_v1");
    setSuggestions(
      trendingSearches.slice(0, 5).map((text) => ({
        text,
        type: "trending" as const,
        icon: <TrendingUp className="size-4 text-app-orange" />,
      }))
    );
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-app-text-light" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch(query);
            }
          }}
          placeholder="ابحث عن منتجات..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-app-border rounded-xl focus:border-app-green outline-none transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-app-cream rounded-full transition-colors"
          >
            <X className="size-4 text-app-text-light" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-app-border rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-app-cream transition-colors text-sm"
                >
                  {suggestion.icon}
                  <span className="text-app-text">{suggestion.text}</span>
                  {suggestion.type === "recent" && (
                    <span className="text-xs text-app-text-light ml-auto">
                      البحث الأخير
                    </span>
                  )}
                </button>
              ))}

              {/* Clear History Button */}
              {recentSearches.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-app-border mt-2 pt-2"
                >
                  🗑️ مسح سجل البحث
                </button>
              )}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-app-text-light">
                {query ? "لا توجد نتائج" : "ابدأ بالبحث..."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
