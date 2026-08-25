import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/api/axios";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutProps {
  cartItems?: CartItem[];
  totalAmount?: number;
  onSuccess?: () => void;
}

const Checkout = ({ cartItems = [], totalAmount = 0, onSuccess }: CheckoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const shippingFee = 5.0;
  const finalTotal = totalAmount + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.address || !formData.city) {
      setError("Please fill in all required shipping fields.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/orders", {
        items: cartItems,
        shippingAddress: formData,
        paymentMethod,
        totalPrice: finalTotal,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/orders");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-app-border shadow-sm">
          <h2 className="text-xl font-bold text-app-green mb-6">Checkout & Shipping</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-app-green mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app-green mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app-green mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                  placeholder="Gaza"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-green mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                placeholder="Street name, building number"
                required
              />
            </div>

            <div className="pt-4 border-t border-app-border">
              <label className="block text-sm font-medium text-app-green mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-center text-sm font-medium transition-colors ${
                    paymentMethod === "card"
                      ? "border-app-green bg-app-cream text-app-green"
                      : "border-app-border hover:bg-gray-50 text-app-text-light"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border text-center text-sm font-medium transition-colors ${
                    paymentMethod === "cod"
                      ? "border-app-green bg-app-cream text-app-green"
                      : "border-app-border hover:bg-gray-50 text-app-text-light"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-1" />
                  Cash on Delivery
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-app-green text-white font-medium rounded-xl hover:bg-app-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Order (${finalTotal.toFixed(2)})
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-app-border shadow-sm h-fit">
          <h3 className="text-lg font-bold text-app-green mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-app-text-light">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-app-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-app-text-light">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-app-text-light">
              <span>Shipping</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-app-green pt-2 border-t border-app-border">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
