import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  TrendingUp,
  Clock,
  Truck,
  Star,
  ArrowRight,
} from "lucide-react";

import Onboarding from "../components/Onboarding";

const Home = () => {
  return (
    <div className="min-h-screen bg-app-cream">
      {/* Onboarding Modal */}
      <Onboarding />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-app-green to-app-green-light py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                توصيل البقالة <br />
                <span className="text-yellow-300">في دقائق</span>
              </h1>
              <p className="text-lg text-white/90 mb-2">
                اختر من آلاف المنتجات الطازة والعضوية
              </p>
              <p className="text-white/80 text-sm mb-6">
                التوصيل السريع • سعر عادل • منتجات طازة 100%
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-white text-app-green font-bold rounded-2xl hover:bg-yellow-300 transition-colors text-lg flex items-center gap-2"
                >
                  <ShoppingBag className="size-5" />
                  ابدأ التسوق الآن
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-colors">
                  اعرف أكثر
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 flex gap-6 text-white">
                <div>
                  <p className="text-3xl font-bold">15M+</p>
                  <p className="text-sm opacity-80">طلبية</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4.8⭐</p>
                  <p className="text-sm opacity-80">تقييم</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">30min</p>
                  <p className="text-sm opacity-80">توصيل</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:block">
              <div className="bg-white rounded-3xl p-4 shadow-2xl">
                <div className="aspect-square bg-app-cream rounded-2xl flex items-center justify-center text-9xl">
                  🛒
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-app-green text-center mb-12">
            لماذا تختار تطبيقنا؟
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Truck className="size-8 text-app-green" />,
                title: "توصيل سريع",
                description: "توصيل في أقل من 30 دقيقة",
              },
              {
                icon: <Star className="size-8 text-app-orange" />,
                title: "منتجات طازة",
                description: "أفضل الفواكه والخضروات يومياً",
              },
              {
                icon: <TrendingUp className="size-8 text-blue-600" />,
                title: "أسعار عادلة",
                description: "أفضل الأسعار والعروض الخاصة",
              },
              {
                icon: <Clock className="size-8 text-purple-600" />,
                title: "متاح 24/7",
                description: "اطلب متى تشاء، نحن دائماً هنا",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-app-cream rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="font-bold text-app-text mb-2">{feature.title}</h3>
                <p className="text-sm text-app-text-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-16 bg-app-cream">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Zap className="size-8 text-app-orange" />
              <h2 className="text-3xl font-bold text-app-green">
                عروض فلاش محدودة
              </h2>
            </div>
            <Link
              to="/flash-deals"
              className="text-app-green font-semibold hover:text-app-orange transition-colors flex items-center gap-1"
            >
              رؤية الكل
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="bg-gradient-to-r from-app-orange to-yellow-400 rounded-3xl p-8 text-white">
            <p className="text-sm opacity-90 mb-2">عرض محدود الوقت</p>
            <h3 className="text-3xl font-bold mb-4">
              خصم حتى 50% على المنتجات المختارة
            </h3>
            <p className="text-white/90 mb-6">
              اشتر الآن واحصل على خصومات رائعة على منتجاتك المفضلة
            </p>
            <Link
              to="/flash-deals"
              className="inline-block px-6 py-3 bg-white text-app-orange font-bold rounded-xl hover:bg-yellow-100 transition-colors"
            >
              اكتشف العروض الآن
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-app-green text-center mb-12">
            كيفية الطلب؟
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, title: "ابحث عن المنتجات", emoji: "🔍" },
              { step: 2, title: "أضف للسلة", emoji: "🛒" },
              { step: 3, title: "ادفع بأمان", emoji: "💳" },
              { step: 4, title: "اتلقى في دقائق", emoji: "🚚" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-app-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {item.emoji}
                </div>
                <p className="font-semibold text-app-text mb-2">
                  الخطوة {item.step}
                </p>
                <p className="text-sm text-app-text-light">{item.title}</p>
                {index < 3 && (
                  <ArrowRight className="hidden md:block size-5 text-app-green mx-auto mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-16 bg-app-green text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            احصل على التطبيق الآن
          </h2>
          <p className="text-lg text-white/90 mb-8">
            تحميل التطبيق للحصول على عروض حصرية وسهولة أكثر
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-6 py-3 bg-white text-app-green font-bold rounded-xl hover:bg-gray-100 transition-colors">
              📱 iOS
            </button>
            <button className="px-6 py-3 bg-white text-app-green font-bold rounded-xl hover:bg-gray-100 transition-colors">
              🤖 Android
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-app-cream">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-app-green mb-4">
            هل أنت مستعد؟
          </h2>
          <p className="text-app-text-light mb-6">
            ابدأ تسوقك الآن واستمتع بتجربة شراء سهلة وسريعة
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-app-green text-white font-bold rounded-2xl hover:bg-app-green-light transition-colors"
          >
            <ShoppingBag className="inline-block mr-2 size-5" />
            ابدأ التسوق الآن
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
