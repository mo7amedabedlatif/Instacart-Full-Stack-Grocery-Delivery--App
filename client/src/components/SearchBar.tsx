import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trending searches (you can replace this with API data)
  const trendingSearches = ["طماطم طازة", "موز عضوي", "تفاح أحمر", "جزر طازة"];

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("app_search_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    }
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Filter trending searches that match the query
    const filtered = trendingSearches.filter((search) =>
      search.includes(query.toLowerCase())
    );

    // Add matching history items
    const historyMatches = searchHistory.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions([...filtered, ...historyMatches].slice(0, 5));
  }, [query, searchHistory]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to history
    const updated = [searchQuery, ...searchHistory.filter((item) => item !== searchQuery)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem("app_search_history", JSON.stringify(updated));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowDropdown(false);
    setQuery("");
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("app_search_history");
  };

  const removeHistoryItem = (item: string) => {
    const updated = searchHistory.filter((h) => h !== item);
    setSearchHistory(updated);
    localStorage.setItem("app_search_history", JSON.stringify(updated));
  };

  return (
    <div className="relative flex-1 max-w-md" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-app-text-light" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query);
            }
          }}
          placeholder="ابحث عن المنتجات..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-app-border rounded-xl text-sm focus:border-app-green outline-none"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-app-cream rounded transition-colors"
          >
            <X className="size-4 text-app-text-light" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-app-border rounded-xl shadow-lg z-40">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 border-b border-app-border">
                <p className="text-xs font-semibold text-app-text-light">اقتراحات</p>
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-4 py-2.5 hover:bg-app-cream flex items-center gap-2 text-sm transition-colors"
                >
                  <Search className="size-4 text-app-text-light" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !query && (
            <div>
              <div className="px-4 py-2 border-b border-app-border flex items-center justify-between">
                <p className="text-xs font-semibold text-app-text-light flex items-center gap-1">
                  <Clock className="size-3" />
                  البحث الأخير
                </p>
                <button
                  onClick={clearHistory}
                  className="text-xs text-app-green hover:text-app-green-light transition-colors"
                >
                  مسح الكل
                </button>
              </div>
              {searchHistory.slice(0, 5).map((item) => (
                <div
                  key={item}
                  className="px-4 py-2.5 hover:bg-app-cream flex items-center justify-between group"
                >
                  <button
                    onClick={() => handleSearch(item)}
                    className="flex-1 text-left text-sm text-app-text"
                  >
                    {item}
                  </button>
                  <button
                    onClick={() => removeHistoryItem(item)}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3 text-app-text-light" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending */}
          {!query && searchHistory.length === 0 && (
            <div>
              <div className="px-4 py-2 border-b border-app-border">
                <p className="text-xs font-semibold text-app-text-light flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  الاتجاهات الحالية
                </p>
              </div>
              {trendingSearches.map((trend) => (
                <button
                  key={trend}
                  onClick={() => handleSearch(trend)}
                  className="w-full text-left px-4 py-2.5 hover:bg-app-cream flex items-center gap-2 text-sm transition-colors"
                >
                  <TrendingUp className="size-4 text-app-orange" />
                  <span>{trend}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-app-text-light">
                لا توجد نتائج لـ "<strong>{query}</strong>"
              </p>
              <button
                onClick={() => handleSearch(query)}
                className="mt-3 text-xs text-app-green hover:text-app-green-light font-medium"
              >
                ابحث عنها على أي حال
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
