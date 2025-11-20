
export enum Tab {
  DASHBOARD = 'painel',
  ORDERS = 'pedidos',
  PRODUCTS = 'produtos',
  CUSTOMERS = 'clientes'
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  image?: string; // Snapshot of the main image at time of order
}

export interface Order {
  id: string;
  customerName: string;
  customerId?: number; // Link to customer
  productSummary: string;
  totalValue: number;
  deliveryDate: string; // ISO string
  status: OrderStatus;
  isNew?: boolean;
  items?: OrderItem[]; // Optional for backward compatibility with mock data
  paymentMethod?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[]; // Changed from single image string to array
  barcode?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  lastOrderDate: string;
  image: string;
  cpfCnpj?: string;
  address?: string;
}

export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  cnpj?: string;
}

export interface UserData {
  profile: CompanyProfile;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  lastUpdated?: string;
}