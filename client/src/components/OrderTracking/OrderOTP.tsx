import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { KeyRound, X, Loader2, CheckCircle } from "lucide-react";
import api from "@/api/axios";

interface OrderOTPProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderOTP = ({ isOpen, orderId, onClose, onSuccess }: OrderOTPProps) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  if (!isOpen) return null;

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 4) {
      setError("Please enter the complete 4-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post(`/orders/${orderId}/verify-otp`, { otp: otpCode });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Invalid OTP code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-xl border border-app-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-app-border">
          <div className="flex items-center gap-2 text-app-green font-bold text-lg">
            <KeyRound className="w-5 h-5" /> Delivery OTP Verification
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-app-text-light hover:text-app-green rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-app-text-light mt-4 mb-6 text-center">
          Ask the customer for the 4-digit verification code sent to their phone to confirm delivery for order{" "}
          <span className="font-semibold text-app-green">#{orderId}</span>.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center">
            {error}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={loading}
              className="w-12 h-14 text-center text-xl font-bold bg-app-cream border border-app-border rounded-2xl focus:border-app-green focus:bg-white outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-app-green text-white font-medium rounded-xl hover:bg-app-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" /> Confirm Delivery
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderOTP;
