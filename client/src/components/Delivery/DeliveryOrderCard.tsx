import { useState } from "react";
import { MapPin, Phone, Package, Clock, CheckCircle2 } from "lucide-react";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  status: "Pending" | "In Delivery" | "Delivered" | "Cancelled";
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onStatusUpdate?: (orderId: string, newStatus: DeliveryOrder["status"]) => void;
  onOpenOtpModal?: (orderId: string) => void;
}

const DeliveryOrderCard = ({
  order,
  onStatusUpdate,
  onOpenOtpModal,
}: DeliveryOrderCardProps) => {
  const [updating, setUpdating] = useState(false);

  const getStatusBadge = (status: DeliveryOrder["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "In Delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleStatusChange = async (newStatus: DeliveryOrder["status"]) => {
    if (newStatus === "Delivered" && onOpenOtpModal) {
      onOpenOtpModal(order.id);
      return;
    }

    if (onStatusUpdate) {
      setUpdating(true);
      await onStatusUpdate(order.id, newStatus);
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-app-border shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-app-border">
        <div>
          <span className="text-xs font-semibold text-app-text-light uppercase tracking-wider">
            Order ID
          </span>
          <h3 className="text-lg font-bold text-app-green">#{order.id}</h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      {/* Customer Info */}
      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-3 text-sm text-app-green">
          <Package className="w-4 h-4 text-app-text-light mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{order.customerName}</span>
        </div>

        <div className="flex items-start gap-3 text-sm text-app-text-light">
          <MapPin className="w-4 h-4 text-app-text-light mt-0.5 flex-shrink-0" />
          <span>{order.address}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-app-text-light">
          <Phone className="w-4 h-4 text-app-text-light flex-shrink-0" />
          <a
            href={`tel:${order.phone}`}
            className="hover:text-app-green transition-colors font-medium"
          >
            {order.phone}
          </a>
        </div>

        <div className="flex items-center gap-3 text-xs text-app-text-light">
          <Clock className="w-4 h-4 text-app-text-light flex-shrink-0" />
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-app-cream/50 rounded-2xl p-3 mb-5 border border-app-border/50">
        <p className="text-xs font-semibold text-app-green mb-2">Items Included:</p>
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="text-xs text-app-text-light flex justify-between"
            >
              <span>• {item.name}</span>
              <span className="font-medium">x{item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-2 border-t border-app-border/40 flex justify-between items-center text-xs font-bold text-app-green">
          <span>Total Amount</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        {order.status === "Pending" && (
          <button
            onClick={() => handleStatusChange("In Delivery")}
            disabled={updating}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Start Delivery
          </button>
        )}

        {order.status === "In Delivery" && (
          <button
            onClick={() => handleStatusChange("Delivered")}
            disabled={updating}
            className="w-full py-2.5 bg-app-green text-white rounded-xl text-xs font-medium hover:bg-app-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Verify & Complete Delivery
          </button>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;
