import { useState, useEffect } from "react";
import { X, ShoppingBag, Truck, Heart, Zap, ChevronRight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding) {
      setShowOnboarding(false);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "أهلاً وسهلاً! 👋",
      description: "في تطبيقنا، يمكنك تصفح آلاف المنتجات الطازة والعضوية وتسليمها في أقل من ساعة!",
      icon: <ShoppingBag className="size-20 text-app-green" />,
      action: "انقر للمتابعة",
      color: "bg-app-cream",
    },
    {
      id: 2,
      title: "ابحث عن منتجاتك المفضلة 🔍",
      description: "استخدم شريط البحث أو اختر من الفئات المختلفة. يمكنك تصفية حسب السعر وحالة الـ Organic.",
      icon: <Zap className="size-20 text-app-orange" />,
      action: "ابدأ التصفح",
      color: "bg-orange-50",
    },
    {
      id: 3,
      title: "أضف للسلة بسهولة 🛒",
      description: "انقر على زر 'إضافة للسلة' أو استخدم الزر + لزيادة الكمية. ستجد السلة في الأسفل يميناً.",
      icon: <ShoppingBag className="size-20 text-app-green" />,
      action: "فهمت",
      color: "bg-app-cream",
    },
    {
      id: 4,
      title: "الدفع سريع وآمن 💳",
      description: "ادخل عنوانك، اختر طريقة الدفع، وتأكد من طلبك. ستتلقى تحديثات فورية عن توصيلك.",
      icon: <Truck className="size-20 text-blue-600" />,
      action: "حسناً",
      color: "bg-blue-50",
    },
    {
      id: 5,
      title: "احفظ المفضلات ❤️",
      description: "انقر على قلب أي منتج لحفظه في قائمة المفضلات. يمكنك العودة إليها لاحقاً بسهولة.",
      icon: <Heart className="size-20 text-red-500" />,
      action: "ابدأ التسوق الآن!",
      color: "bg-red-50",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as complete
      localStorage.setItem("hasSeenOnboarding", "true");
      setShowOnboarding(false);
      navigate("/products");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
    navigate("/products");
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
      <div className={`${step.color} rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in`}>
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition-colors"
        >
          <X className="size-5 text-app-text-light" />
        </button>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-app-text-light">
              {currentStep + 1} من {steps.length}
            </span>
            <span className="text-xs font-medium text-app-text-light">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-app-border rounded-full overflow-hidden">
            <div
              className="h-full bg-app-green transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          {step.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-app-green text-center mb-3">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-app-text-light text-center mb-8 leading-relaxed">
          {step.description}
        </p>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`size-2 rounded-full transition-all ${
                index <= currentStep ? "bg-app-green" : "bg-app-border"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 text-sm font-medium text-app-text-light hover:text-app-text bg-white border border-app-border rounded-xl hover:bg-app-cream transition-colors"
          >
            تخطي
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 text-sm font-medium text-white bg-app-green rounded-xl hover:bg-app-green-light transition-colors flex items-center justify-center gap-2"
          >
            {step.action}
            <ArrowRight className="size-4" />
          </button>
        </div>

        {/* Pro Tip */}
        <div className="mt-6 pt-6 border-t border-app-border">
          <p className="text-xs text-app-text-light text-center">
            💡 يمكنك في أي وقت إغلاق هذا الإرشاد بالضغط على ✕
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
