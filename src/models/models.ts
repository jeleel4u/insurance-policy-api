export interface Policy{
  id: string
  productId: string
  customerName: string
  startDate: string
  endDate: string
  premium: number
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string
}

export interface Product {
  id: string;
  name: string;
  category: 'home' | 'motor' | 'pet' | 'travel';
  description: string;
  basePrice: number;
  createdAt: string;
}

export interface PolicyProduct extends Policy {
  product: Product;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface ApiKey{
    key: string;
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
    permissions: string[];
}

export interface CreatePolicyRequest {
  productId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  premium: number;
  status?: 'active' | 'expired' | 'cancelled';
}

export interface UpdatePolicyRequest {
  productId?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  premium?: number;
  status?: 'active' | 'expired' | 'cancelled';
}