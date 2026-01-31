
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Nebula Pro Smartphone',
    description: 'The latest in mobile technology with a 200MP camera and quantum processing chip.',
    price: 999.99,
    category: Category.ELECTRONICS,
    imageUrl: 'https://picsum.photos/seed/phone/800/600',
    sellerId: 's1',
    stock: 25,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: 'p2',
    name: 'Aether Running Shoes',
    description: 'Ultra-lightweight mesh shoes designed for maximum energy return and speed.',
    price: 129.50,
    category: Category.SPORTS,
    imageUrl: 'https://picsum.photos/seed/shoes/800/600',
    sellerId: 's2',
    stock: 50,
    rating: 4.5,
    reviewsCount: 89
  },
  {
    id: 'p3',
    name: 'Zenith Mechanical Keyboard',
    description: 'Tactile, wireless, and beautifully RGB-lit keyboard for ultimate productivity.',
    price: 189.00,
    category: Category.ELECTRONICS,
    imageUrl: 'https://picsum.photos/seed/keyboard/800/600',
    sellerId: 's1',
    stock: 12,
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: 'p4',
    name: 'Lumina Smart Bulb Set',
    description: 'Set of 4 WiFi-controlled bulbs compatible with all voice assistants.',
    price: 45.00,
    category: Category.HOME,
    imageUrl: 'https://picsum.photos/seed/light/800/600',
    sellerId: 's3',
    stock: 100,
    rating: 4.2,
    reviewsCount: 230
  },
  {
    id: 'p5',
    name: 'Titan Leather Jacket',
    description: 'Premium handcrafted leather jacket with a timeless aesthetic and rugged build.',
    price: 350.00,
    category: Category.FASHION,
    imageUrl: 'https://picsum.photos/seed/jacket/800/600',
    sellerId: 's2',
    stock: 10,
    rating: 4.7,
    reviewsCount: 42
  }
];

export const CATEGORIES = Object.values(Category);
