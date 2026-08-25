import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import api from "@/api/axios";

interface CancelModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelModal = ({ isOpen, orderId, onClose, onSuccess }: CancelModalProps) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmCancel = async () => {
    if (!reason.trim()) {
      setError("Please select or write a reason for cancellation.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.patch(`/orders/${orderId}/cancel`, { reason });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to cancel order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-app-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-app-border">
          <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
            <AlertTriangle className="w-5 h-5" /> Cancel Order
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-app-text-light hover:text-app-green rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-app-text-light mt-4 mb-4">
          Are you sure you want to cancel order <span className="font-semibold text-app-green">#{orderId}</span>? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-app-green">
            Reason for Cancellation *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 rounded-xl border border-app-border focus:border-app-green outline-none text-sm bg-white"
          >
            <option value="">Select a reason</option>
            <option value="Ordered by mistake">Ordered by mistake</option>
            <option value="Delivery time too long">Delivery time too long</option>
            <option value="Found a better price">Found a better price</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-app-text-light hover:bg-app-cream border border-app-border rounded-xl transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirmCancel}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
