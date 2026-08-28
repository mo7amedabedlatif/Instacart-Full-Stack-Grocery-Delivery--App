export interface User {
  id: string;  // ✅ بدل _id
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;  // ✅ بدل _id
  name: string;
  description: string;
  price: number;
  // ... باقي الحقول
}

export interface Address {
  id: string;  // ✅ بدل _id
  label: string;
  // ... باقي الحقول
}

export interface DeliveryPartner {
  id: string;  // ✅ بدل _id
  name: string;
  // ... باقي الحقول
}

export interface Order {
  id: string;  // ✅ بدل _id
  user: string | { id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  shippingAddress: Omit<Address, "id" | "isDefault">;  // ✅ تم التصحيح
  // ... باقي الحقول
}
