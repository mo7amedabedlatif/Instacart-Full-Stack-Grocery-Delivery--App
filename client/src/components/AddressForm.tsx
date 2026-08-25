import { useState, FormEvent, ChangeEvent } from "react";
import { MapPin, Loader2, Save, X } from "lucide-react";
import api from "@/api/axios";

export interface AddressData {
  id?: string;
  street: string;
  building: string;
  city: string;
  phone: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initialData?: AddressData | null;
  onSuccess?: (address: AddressData) => void;
  onCancel?: () => void;
}

const AddressForm = ({ initialData, onSuccess, onCancel }: AddressFormProps) => {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState<AddressData>({
    street: initialData?.street || "",
    building: initialData?.building || "",
    city: initialData?.city || "Gaza",
    phone: initialData?.phone || "",
    isDefault: initialData?.isDefault || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.street.trim() || !formData.city.trim() || !formData.phone.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isEdit && initialData?.id) {
        response = await api.put(`/addresses/${initialData.id}`, formData);
      } else {
        response = await api.post("/addresses", formData);
      }

      const savedAddress = response.data?.address || formData;
      if (onSuccess) onSuccess(savedAddress);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save address. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-app-border shadow-sm max-w-lg mx-auto">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-app-border">
        <div className="flex items-center gap-2 text-app-green font-bold text-lg">
          <MapPin className="w-5 h-5" />
          {isEdit ? "Edit Delivery Address" : "Add New Address"}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-app-text-light hover:text-app-green rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-app-green mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Gaza"
            className="w-full px-3.5 py-2 rounded-xl border border-app-border focus:border-app-green outline-none text-sm transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-app-green mb-1">
            Street Address *
          </label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Main St., Near Al-Azhar"
            className="w-full px-3.5 py-2 rounded-xl border border-app-border focus:border-app-green outline-none text-sm transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-app-green mb-1">
              Building / Apartment
            </label>
            <input
              type="text"
              name="building"
              value={formData.building}
              onChange={handleChange}
              placeholder="Apt 4B"
              className="w-full px-3.5 py-2 rounded-xl border border-app-border focus:border-app-green outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-app-green mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="059xxxxxxx"
              className="w-full px-3.5 py-2 rounded-xl border border-app-border focus:border-app-green outline-none text-sm transition-colors"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="w-4 h-4 text-app-green border-app-border rounded focus:ring-app-green cursor-pointer"
          />
          <label htmlFor="isDefault" className="text-xs text-app-text-light cursor-pointer select-none">
            Set as default shipping address
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm text-app-text-light hover:bg-app-cream rounded-xl transition-colors border border-app-border"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-app-green text-white text-sm font-medium rounded-xl hover:bg-app-green-light transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Address
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
