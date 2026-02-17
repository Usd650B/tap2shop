export interface Shop {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  contact_info: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_style?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  customer_name: string;
  customer_contact: string;
  delivery_address: string;
  delivery_location: string;
  quantity: number;
  note?: string;
  status: 'Pending' | 'Accepted' | 'Delivered' | 'Received' | 'Completed' | 'Rejected';
  created_at: string;
  updated_at: string;
  delivered_at?: string;
  received_at?: string;
}

export interface OrderWithProduct extends Order {
  product: Product;
  shop: Shop;
}
