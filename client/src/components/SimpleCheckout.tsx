import { useState } from "react";
import { ChevronDown, MapPinIcon, CreditCardIcon, CheckIcon, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";

interface SimpleCheckoutProps {
  items: any[];
  cartTotal: number;
  onSuccess: (orderId: string) => void;
}

const SimpleCheckout = ({ items, cartTotal, onSuccess }: SimpleCheckoutProps) => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const [expandedSection, setExpandedSection] = useState("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [address, setAddress] = useState({
    label: "Home",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [payment, setPayment] = useState("card");

  const validateForm = () => {
    if (!address.address.trim()) {
      setError("يرجى إدخال العنوان");
      return false;
    }
    if (!address.city.trim()) {
      setError("يرجى إدخال المدينة");
      return false;
    }
    if (!address.zip.trim()) {
      setError("يرجى إدخال الرمز البريدي");
      return false;
    }
    if (!payment) {
      setError("يرجى اختيار طريقة دفع");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod: payment,
      });

      if (!data?.order?.id) {
        throw new Error("خطأ في إنشاء الطلب");
      }

      toast.success("تم وضع الطلب بنجاح! 🎉");
      onSuccess(data.order.id);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "فشل وضع الطلب";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  return (
    <div className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">خطأ</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Address Section */}
      <div className="bg-white border border-app-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === "address" ? "" : "address")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-app-cream/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-8 bg-app-green/10 rounded-full flex items-center justify-center">
              <MapPinIcon className="size-4 text-app-green" />
            </div>
            <div>
              <p className="font-semibold text-app-green text-sm">عنوان التوصيل</p>
              {address.address && (
                <p className="text-xs text-app-text-light">
                  {address.address}, {address.city}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`size-5 text-app-text-light transition-transform ${
              expandedSection === "address" ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Address Form */}
        {expandedSection === "address" && (
          <div className="border-t border-app-border px-5 py-4 space-y-3 bg-app-cream/30">
            <label className="block">
              <span className="text-xs font-medium text-app-text-light mb-1 block">
                تسمية العنوان
              </span>
              <select
                value={address.label}
                onChange={(e) => setAddress({ ...address, label: e.target.value })}
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-app-text-light mb-1 block">
                العنوان بالتفصيل *
              </span>
              <input
                type="text"
                value={address.address}
                onChange={(e) => setAddress({ ...address, address: e.target.value })}
                placeholder="الشارع ورقم المبنى"
                className="w-full px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-app-text-light mb-1 block">
                  المدينة *
                </span>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="المدينة"
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-app-text-light mb-1 block">
                  الرمز البريدي *
                </span>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-app-border rounded-lg text-sm focus:border-app-green outline-none"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="bg-white border border-app-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === "payment" ? "" : "payment")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-app-cream/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-8 bg-app-green/10 rounded-full flex items-center justify-center">
              <CreditCardIcon className="size-4 text-app-green" />
            </div>
            <div>
              <p className="font-semibold text-app-green text-sm">طريقة الدفع</p>
              <p className="text-xs text-app-text-light capitalize">{payment}</p>
            </div>
          </div>
          <ChevronDown
            className={`size-5 text-app-text-light transition-transform ${
              expandedSection === "payment" ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Payment Options */}
        {expandedSection === "payment" && (
          <div className="border-t border-app-border px-5 py-4 space-y-2 bg-app-cream/30">
            {["card", "wallet", "cash"].map((method) => (
              <label key={method} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={payment === method}
                  onChange={(e) => setPayment(e.target.value)}
                  className="text-app-green"
                />
                <span className="text-sm font-medium text-app-text">
                  {method === "card" && "💳 بطاقة信用"}
                  {method === "wallet" && "📱 المحفظة الرقمية"}
                  {method === "cash" && "💵 الدفع عند الاستلام"}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-app-cream rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-app-text-light">السعر الأساسي:</span>
          <span className="font-medium">
            {currency}
            {cartTotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-app-text-light">رسوم التوصيل:</span>
          <span className={`font-medium ${deliveryFee === 0 ? "text-app-green" : ""}`}>
            {deliveryFee === 0 ? "مجاني ✓" : `${currency}${deliveryFee.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-app-text-light">الضريبة:</span>
          <span className="font-medium">
            {currency}
            {tax.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-app-border pt-2 flex justify-between">
          <span className="font-semibold text-app-green">الإجمالي:</span>
          <span className="text-lg font-bold text-app-green">
            {currency}
            {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-900 font-medium mb-2">💡 نصيحة سريعة:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ ستصل طلبيتك في غضون 30-60 دقيقة</li>
          <li>✓ يمكنك تتبع الطلب في الوقت الفعلي</li>
          <li>✓ توصيل مجاني للطلبات فوق 20 دولار</li>
        </ul>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
        className="w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            جاري وضع الطلب...
          </>
        ) : (
          <>
            <CheckIcon className="size-5" />
            تأكيد وشراء الآن
          </>
        )}
      </button>

      {/* Safe Payment Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-app-text-light">
        <div className="size-4 bg-app-green text-white rounded-full flex items-center justify-center text-[10px] font-bold">
          ✓
        </div>
        <span>جميع المعاملات آمنة وموثوقة 100%</span>
      </div>
    </div>
  );
};

export default SimpleCheckout;
