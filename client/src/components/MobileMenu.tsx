import { X, Home, Search, Heart, ShoppingBag, User, Settings, LogOut, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { wishlist } = useWishlist();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/login");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-white z-50 overflow-y-auto rounded-r-3xl">
        {/* Close Button */}
        <div className="sticky top-0 bg-white border-b border-app-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-app-green">القائمة</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-cream rounded-full transition-colors"
          >
            <X className="size-5 text-app-text-light" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 bg-app-cream/50 border-b border-app-border">
            <p className="font-semibold text-app-text">{user.name}</p>
            <p className="text-sm text-app-text-light">{user.email}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="px-6 py-4 space-y-2 border-b border-app-border">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors"
          >
            <Home className="size-5 text-app-green" />
            <span className="font-medium">الرئيسية</span>
          </Link>
          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors"
          >
            <Search className="size-5 text-app-green" />
            <span className="font-medium">المنتجات</span>
          </Link>
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors relative"
          >
            <Heart className="size-5 text-app-green" />
            <span className="font-medium">المفضلات</span>
            {wishlist.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors relative"
          >
            <ShoppingBag className="size-5 text-app-green" />
            <span className="font-medium">طلباتي</span>
            {items.length > 0 && (
              <span className="ml-auto bg-app-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>
        </div>

        {/* Account */}
        {user && (
          <div className="px-6 py-4 space-y-2 border-b border-app-border">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors"
            >
              <User className="size-5 text-app-green" />
              <span className="font-medium">ملفي الشخصي</span>
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors"
            >
              <Settings className="size-5 text-app-green" />
              <span className="font-medium">الإعدادات</span>
            </Link>
          </div>
        )}

        {/* Help & Support */}
        <div className="px-6 py-4 space-y-2 border-b border-app-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-app-text rounded-lg hover:bg-app-cream transition-colors text-left">
            <HelpCircle className="size-5 text-app-green" />
            <span className="font-medium">المساعدة والدعم</span>
          </button>
        </div>

        {/* Logout */}
        {user && (
          <div className="px-6 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="size-5" />
              تسجيل الخروج
            </button>
          </div>
        )}

        {/* App Version */}
        <div className="px-6 py-4 text-center text-xs text-app-text-light border-t border-app-border">
          <p>النسخة 1.0.0</p>
          <p className="mt-1">© 2024 Instacart</p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
