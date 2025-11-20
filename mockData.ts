
import { Customer, Order, OrderStatus, Product, CompanyProfile } from './types';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Fábrica de Delícias Ltda',
  email: 'contato@fabricadelicias.com.br',
  phone: '(11) 98888-7777',
  address: 'Av. Industrial, 1000 - Distrito Industrial, São Paulo - SP',
  logo: 'https://picsum.photos/seed/company/200/200',
  cnpj: '12.345.678/0001-99'
};

export const MOCK_CUSTOMERS: Customer[] = [
  { 
    id: 1, 
    name: 'Padaria do João', 
    phone: '+55 11 99999-0001', 
    lastOrderDate: '2023-10-25', 
    image: 'https://picsum.photos/seed/bakery/200/200',
    cpfCnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123, Centro - São Paulo, SP'
  },
  { 
    id: 2, 
    name: 'Mercado Central', 
    phone: '+55 11 99999-0002', 
    lastOrderDate: '2023-10-20', 
    image: 'https://picsum.photos/seed/market/200/200',
    cpfCnpj: '98.765.432/0001-10',
    address: 'Av. Principal, 500, Mercado - Rio de Janeiro, RJ'
  },
  { 
    id: 3, 
    name: 'Ana Bolos e Doces', 
    phone: '+55 11 99999-0003', 
    lastOrderDate: '2023-10-26', 
    image: 'https://picsum.photos/seed/cakes/200/200',
    cpfCnpj: '111.222.333-44',
    address: 'Rua do Açúcar, 45, Vila Doce - Belo Horizonte, MG'
  },
  { 
    id: 4, 
    name: 'Restaurante Sabor', 
    phone: '+55 11 99999-0004', 
    lastOrderDate: '2023-10-15', 
    image: 'https://picsum.photos/seed/rest/200/200',
    cpfCnpj: '22.333.444/0001-55',
    address: 'Alameda Gastronômica, 88, Jardins - Curitiba, PR'
  },
  { 
    id: 5, 
    name: 'Café da Esquina', 
    phone: '+55 11 99999-0005', 
    lastOrderDate: '2023-10-27', 
    image: 'https://picsum.photos/seed/coffee/200/200',
    cpfCnpj: '55.666.777/0001-88',
    address: 'Praça da Sé, 10, Centro - Salvador, BA'
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Farinha de Trigo Premium', category: 'Insumos', price: 12.50, stock: 500, images: ['https://picsum.photos/seed/flour/400/400', 'https://picsum.photos/seed/wheat/400/400'], barcode: '7890001234561' },
  { id: 'p2', name: 'Chocolate em Pó 50%', category: 'Confeitaria', price: 35.00, stock: 120, images: ['https://picsum.photos/seed/choc/400/400'], barcode: '7890001234562' },
  { id: 'p3', name: 'Fermento Biológico', category: 'Insumos', price: 5.90, stock: 200, images: ['https://picsum.photos/seed/yeast/400/400'], barcode: '7890001234563' },
  { id: 'p4', name: 'Essência de Baunilha', category: 'Aromas', price: 18.90, stock: 50, images: ['https://picsum.photos/seed/vanilla/400/400'], barcode: '7890001234564' },
  { id: 'p5', name: 'Creme de Leite Industrial', category: 'Laticínios', price: 22.00, stock: 80, images: ['https://picsum.photos/seed/cream/400/400'], barcode: '7890001234565' },
];

export const MOCK_ORDERS: Order[] = [
  { 
    id: 'o1', 
    customerName: 'Padaria do João', 
    customerId: 1, 
    productSummary: '50kg Farinha, 10kg Fermento', 
    totalValue: 684.00, 
    deliveryDate: '2023-10-28T10:00:00', 
    status: OrderStatus.PENDING, 
    isNew: true,
    items: [
      { productId: 'p1', productName: 'Farinha de Trigo Premium', quantity: 50, unitPrice: 12.50, image: 'https://picsum.photos/seed/flour/400/400' },
      { productId: 'p3', productName: 'Fermento Biológico', quantity: 10, unitPrice: 5.90, image: 'https://picsum.photos/seed/yeast/400/400' }
    ]
  },
  { 
    id: 'o2', 
    customerName: 'Ana Bolos e Doces', 
    customerId: 3, 
    productSummary: '5kg Chocolate, 2L Baunilha', 
    totalValue: 212.80, 
    deliveryDate: '2023-10-29T14:00:00', 
    status: OrderStatus.PENDING, 
    isNew: true,
    items: [
      { productId: 'p2', productName: 'Chocolate em Pó 50%', quantity: 5, unitPrice: 35.00, image: 'https://picsum.photos/seed/choc/400/400' },
      { productId: 'p4', productName: 'Essência de Baunilha', quantity: 2, unitPrice: 18.90, image: 'https://picsum.photos/seed/vanilla/400/400' }
    ]
  },
  { 
    id: 'o3', 
    customerName: 'Mercado Central', 
    customerId: 2, 
    productSummary: '100 un. Pães Congelados', 
    totalValue: 1500.00, 
    deliveryDate: '2023-10-25T09:00:00', 
    status: OrderStatus.COMPLETED,
    items: [
      { productId: 'p1', productName: 'Pães Congelados (Fardo)', quantity: 100, unitPrice: 15.00, image: 'https://picsum.photos/seed/bread/400/400' }
    ]
  },
  { 
    id: 'o4', 
    customerName: 'Café da Esquina', 
    customerId: 5, 
    productSummary: '20kg Café Torrado', 
    totalValue: 800.00, 
    deliveryDate: '2023-10-30T08:00:00', 
    status: OrderStatus.PENDING,
    items: [
      { productId: 'p1', productName: 'Café Torrado Especial', quantity: 20, unitPrice: 40.00, image: 'https://picsum.photos/seed/coffeebean/400/400' }
    ]
  },
  { 
    id: 'o5', 
    customerName: 'Restaurante Sabor', 
    customerId: 4, 
    productSummary: 'Kit Temperos', 
    totalValue: 450.00, 
    deliveryDate: '2023-10-24T11:00:00', 
    status: OrderStatus.COMPLETED,
    items: [
       { productId: 'p4', productName: 'Kit Temperos Completos', quantity: 10, unitPrice: 45.00, image: 'https://picsum.photos/seed/spices/400/400' }
    ]
  },
];
