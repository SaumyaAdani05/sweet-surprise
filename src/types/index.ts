export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  imageHint?: string;
  description: string;
  category: string;
  price?: string; 
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface CartItem {
  cartItemId: string; // product.id + weight
  product: Product;
  quantity: number;
  selectedWeight?: string; // e.g., "500g", "1kg" for cakes; "250g", "500g" for chocolates
  priceAtSelection: number; // calculated single item price
}

export interface User {
  username: string;
  name: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  username: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    weight?: string;
    price: number; // total price for this item (single price * quantity)
  }[];
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentConfirmed?: boolean;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'login' | 'purchase' | 'contact';
  message: string;
  details: string;
  createdAt: string;
  read: boolean;
}
