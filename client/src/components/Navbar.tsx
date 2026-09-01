import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, LogOut, Shield, Menu, X } from "lucide-react";

interface NavbarProps {
  cartCount?: number;
}

const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load auth state once on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");
      setIsAuthenticated(Boolean(token));
      setIsAdmin(userRole === "admin");
    } catch (err) {
      console.warn("Failed to load auth state from localStorage");
    }
  }, []);

  // Close mobile menu on scroll (only attach once)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      
      // Close menu only if it's open and user scrolled
      if (window.scrollY > 50) {
        setMobileMenuOpen(prev => prev ? false : false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty dependency array - attach once only

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    } catch (err) {
      console.warn("Failed to clear auth data:", err);
    }
    setIsAuthenticated(false);
    setIsAdmin(false);
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-app-border transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-app-green tracking-tight">
          Fresh<span className="text-emerald-500">Store</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-app-text-light">
          <Link to="/" className="hover:text-app-green transition-colors">
            Home
          </Link>
          <Link to="/products" className="hover:text-app-green transition-colors">
            Products
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="hover:text-app-green transition-colors flex items-center gap-1.5 text-emerald-600 font-semibold"
            >
              <Shield className="w-4 h-4" /> Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/cart"
            className="relative p-2.5 text-app-green hover:bg-app-cream rounded-xl transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="p-2.5 text-app-green hover:bg-app-cream rounded-xl transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-medium bg-app-green text-white rounded-xl hover:bg-app-green-light transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-app-green rounded-xl hover:bg-app-cream"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer with Smooth Animation */}
      {mobileMenuOpen && (
        <>
          {/* Overlay backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-app-border px-4 pt-2 pb-6 space-y-3 z-40 shadow-lg animate-slide-in-down">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-app-green hover:text-app-green-light transition-colors"
            >
              🏠 Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-app-green hover:text-app-green-light transition-colors"
            >
              🛒 Products
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                🛡️ Admin Dashboard
              </Link>
            )}

            <div className="pt-4 border-t border-app-border flex items-center justify-between">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-app-green hover:text-app-green-light transition-colors"
              >
                <ShoppingBag className="w-5 h-5" /> Cart ({cartCount})
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-app-green text-white rounded-xl hover:bg-app-green-light transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Navbar;
