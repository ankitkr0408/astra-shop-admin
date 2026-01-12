export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: User | string;
  orderItems: {
    product: Product | string;
    name: string;
    qty: number;
    price: number;
    image: string;
  }[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
  };
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  razorpayOrderId?: string;
  shiprocketOrderId?: string;
  shipmentId?: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}