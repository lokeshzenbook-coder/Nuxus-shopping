
import { Product, Order, CartItem, User } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

// Simulated DB logic using localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'nexus_products',
  ORDERS: 'nexus_orders',
  USER: 'nexus_user'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    await delay(500);
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
  },

  saveProduct: async (product: Product): Promise<void> => {
    await delay(800);
    const products = await ProductService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: async (id: string): Promise<void> => {
    const products = await ProductService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  }
};

export const OrderService = {
  placeOrder: async (userId: string, items: CartItem[], total: number): Promise<Order> => {
    await delay(1200);
    const newOrder: Order = {
      id: `ord_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const orders = await OrderService.getOrders();
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  getOrders: async (): Promise<Order[]> => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  }
};
