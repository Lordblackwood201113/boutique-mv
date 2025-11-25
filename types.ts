export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserInfo {
  name: string;
  phone: string;
  location: string;
}

export type ViewState = 'home' | 'product_detail' | 'catalog';