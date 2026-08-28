import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckIcon,
  ChevronRightIcon,
  CreditCardIcon,
  MapPinIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import { useCart } from "../context/CartContext";
import type { Address } from "../types";
import CheckoutAddress from "../components/Checkout/CheckoutAddress";
import CheckoutPayment from "../components/Checkout/CheckoutPayment";
import CheckoutReview from "../components/Checkout/CheckoutReview";
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

const Checkout = () => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

  const { items, cartTotal, clearCart } = useCart();
  const { user, loading } = useAuth();

  const [step, setStep] = useState("address");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [address, setAddress] = useState<Address>({
    id: "",
    label: "Home",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
    lat: 0,
    lng: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState("card");

  // ✅ User validation effect
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please login to checkout");
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  // ✅ Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !checkoutLoading) {
      toast.error("Your cart is empty");
      navigate("/products");
    }
  }, [items, navigate, checkoutLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-green"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const deliveryFee = cartTotal > 20 ? 0 : 1.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + deliveryFee + tax;

  const steps: { key: string; label: string; icon: typeof MapPinIcon }[] = [
    { key: "address", label: "Address", icon: MapPinIcon },
    { key: "payment", label: "Payment", icon: CreditCardIcon },
    { key: "review", label: "Review", icon: CheckIcon },
  ];

  const handleNextStep = async () => {
    if (step === "address") {
      if (!address.address || !address.city || !address.zip) {
        toast.error("Please fill in all address fields");
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      setStep("review");
    }
  };

  const handlePrevStep = () => {
    const currentIndex = steps.findIndex((s) => s.key === step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].key);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
      });

      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/orders/${data.order.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to place order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-cream py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-sm text-app-text-light hover:text-app-green transition-colors mb-6"
          >
            <ArrowLeft className="size-4" /> Back to Shopping
          </button>
          <h1 className="text-3xl font-semibold text-app-green">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Steps */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((s, index) => (
                  <div key={s.key} className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        const currentIndex = steps.findIndex(
                          (st) => st.key === step
                        );
                        if (index < currentIndex) {
                          setStep(s.key);
                        }
                      }}
                      className={`flex items-center gap-3 pb-4 transition-colors ${
                        step === s.key
                          ? "border-b-2 border-app-green text-app-green font-semibold"
                          : "text-app-text-light"
                      }`}
                    >
                      <s.icon className="size-5" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-colors ${
                          steps.findIndex((st) => st.key === step) > index
                            ? "bg-app-green"
                            : "bg-app-border"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl p-6">
              {step === "address" && (
                <CheckoutAddress address={address} setAddress={setAddress} />
              )}
              {step === "payment" && (
                <CheckoutPayment
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                />
              )}
              {step === "review" && (
                <CheckoutReview items={items} address={address} />
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handlePrevStep}
                  disabled={step === "address"}
                  className="px-6 py-3 border border-app-border rounded-xl font-semibold text-app-text-light hover:bg-app-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {step !== "review" ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 px-6 py-3 bg-app-green text-white rounded-xl font-semibold hover:bg-app-green-dark transition-colors"
                  >
                    Next <ChevronRightIcon className="size-4" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={checkoutLoading}
                    className="flex-1 px-6 py-3 bg-app-orange text-white rounded-xl font-semibold hover:bg-app-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {checkoutLoading ? "Processing..." : "Place Order"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-app-green mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 border-b border-app-border pb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-app-text-light">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {currency}
                      {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-app-text-light">Subtotal</span>
                  <span className="font-semibold">
                    {currency}
                    {cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-text-light">Delivery Fee</span>
                  <span className="font-semibold">
                    {currency}
                    {deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-app-text-light">Tax</span>
                  <span className="font-semibold">
                    {currency}
                    {tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-app-border pt-4 flex justify-between">
                <span className="font-semibold text-app-green">Total</span>
                <span className="text-xl font-bold text-app-green">
                  {currency}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
