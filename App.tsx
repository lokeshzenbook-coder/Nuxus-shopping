
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  LayoutDashboard, 
  Bot,
  ArrowRight,
  PlusCircle,
  Package,
  CheckCircle,
  CreditCard,
  Trash2
} from 'lucide-react';

import { Product, Category, User, CartItem, Order, ChatMessage } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants';
import { ProductService, OrderService } from './services/apiService';
import { getShoppingAdvice, generateProductDescription } from './services/geminiService';

// --- Components ---

const Navbar = ({ cartCount, user }: { cartCount: number, user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="glass sticky top-0 z-50 w-full shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              NexusMarket
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-slate-600 hover:text-indigo-600 font-medium transition">Shop</Link>
            {user?.role === 'seller' && (
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium transition">Seller Panel</Link>
            )}
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="p-2 text-slate-600 hover:text-indigo-600 transition">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
             <Link to="/cart" className="relative p-2 text-slate-600">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>}
             </Link>
             <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-300">
          <Link to="/shop" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Shop</Link>
          {user?.role === 'seller' && <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Seller Panel</Link>}
          <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-slate-600 font-medium">Profile</Link>
        </div>
      )}
    </nav>
  );
};

// Added React.FC type to ProductCard to resolve the TypeScript error regarding the 'key' prop when used in lists.
const ProductCard: React.FC<{ product: Product, addToCart: (p: Product) => void }> = ({ product, addToCart }) => (
  <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="relative aspect-video overflow-hidden">
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-semibold text-slate-700">
        {product.category}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h3>
      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
        <button 
          onClick={() => addToCart(product)}
          className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition text-sm font-medium"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Add</span>
        </button>
      </div>
    </div>
  </div>
);

const AIAssistant = ({ products }: { products: Product[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am Nexus AI. Ask me for shopping advice!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getShoppingAdvice(input, products);
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 md:w-96 h-[500px] glass shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <span className="font-bold">Nexus AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl text-slate-500 text-sm animate-pulse">AI is thinking...</div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 flex space-x-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Suggest a smartphone..."
            />
            <button onClick={sendMessage} className="bg-indigo-600 text-white p-2 rounded-xl">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg animate-float"
        >
          <Bot className="h-8 w-8" />
        </button>
      )}
    </div>
  );
};

// --- Pages ---

const HomePage = ({ products, addToCart }: { products: Product[], addToCart: (p: Product) => void }) => (
  <div className="space-y-16 py-8">
    {/* Hero Section */}
    <section className="relative rounded-3xl overflow-hidden bg-slate-900 text-white py-20 px-8">
      <div className="absolute inset-0 opacity-40">
        <img src="https://picsum.photos/seed/tech/1600/900" className="w-full h-full object-cover" alt="Hero" />
      </div>
      <div className="relative max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Next-Gen Commerce <br/><span className="text-indigo-400 underline decoration-indigo-400">Simplified.</span>
        </h1>
        <p className="text-lg text-slate-300 mb-8 max-w-lg">
          Discover a curated marketplace of world-class products. Shop smarter with Nexus AI and build your empire as a seller.
        </p>
        <div className="flex space-x-4">
          <Link to="/shop" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center transition">
            Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link to="/dashboard" className="glass text-white px-8 py-4 rounded-2xl font-bold flex items-center transition">
            Become a Seller
          </Link>
        </div>
      </div>
    </section>

    {/* Featured Products */}
    <section>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Featured Trends</h2>
          <p className="text-slate-500">Handpicked items popular right now</p>
        </div>
        <Link to="/shop" className="text-indigo-600 font-semibold hover:underline flex items-center">
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.slice(0, 4).map(p => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </div>
    </section>
  </div>
);

const ShopPage = ({ products, addToCart }: { products: Product[], addToCart: (p: Product) => void }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => 
    (filter === 'All' || p.category === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Marketplace</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500">No products found for your search.</p>
        </div>
      )}
    </div>
  );
};

const CartPage = ({ items, products, onUpdate, onCheckout }: { 
  items: CartItem[], 
  products: Product[], 
  onUpdate: (id: string, q: number) => void,
  onCheckout: () => void 
}) => {
  const cartDetails = items.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  })).filter(d => !!d.product);

  const total = cartDetails.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  if (items.length === 0) return (
    <div className="py-20 text-center space-y-6">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
        <ShoppingCart className="h-10 w-10" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">Your cart is empty</h2>
      <p className="text-slate-500 max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
      <Link to="/shop" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold">Start Shopping</Link>
    </div>
  );

  return (
    <div className="py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
        {cartDetails.map(item => (
          <div key={item.productId} className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-200">
            <img src={item.product.imageUrl} className="w-20 h-20 object-cover rounded-xl" alt={item.product.name} />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{item.product.name}</h3>
              <p className="text-sm text-slate-500">${item.product.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onUpdate(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
              >-</button>
              <span className="font-semibold">{item.quantity}</span>
              <button 
                onClick={() => onUpdate(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
              >+</button>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
            </div>
            <button 
              onClick={() => onUpdate(item.productId, 0)}
              className="p-2 text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between text-xl font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center transition"
          >
            <CreditCard className="mr-2 h-5 w-5" /> Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerDashboard = ({ products, onAddProduct, onDeleteProduct }: { 
  products: Product[], 
  onAddProduct: (p: Partial<Product>) => void,
  onDeleteProduct: (id: string) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newP, setNewP] = useState({ name: '', price: '', category: Category.ELECTRONICS, stock: '10' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = async () => {
    onAddProduct({
      name: newP.name,
      price: parseFloat(newP.price),
      category: newP.category,
      stock: parseInt(newP.stock),
      description: 'Auto-generated high-quality listing description.',
      imageUrl: `https://picsum.photos/seed/${newP.name.replace(/\s+/g, '')}/800/600`
    });
    setIsAdding(false);
    setNewP({ name: '', price: '', category: Category.ELECTRONICS, stock: '10' });
  };

  const generateAI = async () => {
    if (!newP.name) return;
    setIsGenerating(true);
    try {
      const desc = await generateProductDescription(newP.name, newP.category);
      alert(`AI Suggestion for ${newP.name}:\n\n${desc}`);
    } catch(e) {}
    finally { setIsGenerating(false); }
  }

  return (
    <div className="py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="text-slate-500">Manage your inventory and insights</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-indigo-200"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900">$12,450.00</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Active Listings</p>
          <p className="text-3xl font-bold text-slate-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Pending Orders</p>
          <p className="text-3xl font-bold text-slate-900">14</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-900">Inventory Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={p.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt="" />
                      <span className="font-semibold text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.category}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-6">Create New Listing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name</label>
                <input 
                  value={newP.name}
                  onChange={e => setNewP({...newP, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. Vintage Camera"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input 
                    type="number"
                    value={newP.price}
                    onChange={e => setNewP({...newP, price: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Stock Level</label>
                  <input 
                    type="number"
                    value={newP.stock}
                    onChange={e => setNewP({...newP, stock: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select 
                  value={newP.category}
                  onChange={e => setNewP({...newP, category: e.target.value as Category})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button 
                onClick={generateAI}
                disabled={!newP.name || isGenerating}
                className="w-full flex items-center justify-center text-indigo-600 text-sm font-bold border border-indigo-100 bg-indigo-50 py-3 rounded-xl hover:bg-indigo-100 transition"
              >
                {isGenerating ? 'AI is writing...' : <><Bot className="mr-2 h-4 w-4" /> Enhance with AI</>}
              </button>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => setIsAdding(false)} className="flex-1 text-slate-500 font-bold py-3 hover:text-slate-700 transition">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">List Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Logic ---

const App = () => {
  const [user, setUser] = useState<User | null>({ id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'seller' });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const p = await ProductService.getProducts();
      const o = await OrderService.getOrders();
      setProducts(p);
      setOrders(o);
      setLoading(false);
    };
    init();
  }, []);

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: p.id, quantity: 1 }];
    });
  }, []);

  const updateCart = useCallback((id: string, q: number) => {
    if (q <= 0) {
      setCart(prev => prev.filter(item => item.productId !== id));
    } else {
      setCart(prev => prev.map(item => item.productId === id ? { ...item, quantity: q } : item));
    }
  }, []);

  const checkout = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, curr) => {
      const p = products.find(prod => prod.id === curr.productId);
      return acc + (p ? p.price * curr.quantity : 0);
    }, 0);

    const order = await OrderService.placeOrder(user!.id, cart, total);
    setOrders(prev => [order, ...prev]);
    setCart([]);
    alert(`Order #${order.id} placed successfully!`);
  };

  const addProduct = async (p: Partial<Product>) => {
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: p.name!,
      description: p.description!,
      price: p.price!,
      category: p.category!,
      imageUrl: p.imageUrl!,
      sellerId: user!.id,
      stock: p.stock!,
      rating: 0,
      reviewsCount: 0
    };
    await ProductService.saveProduct(newProduct);
    setProducts(prev => [newProduct, ...prev]);
  };

  const deleteProduct = async (id: string) => {
    await ProductService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse">Initializing Nexus Engines...</p>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar cartCount={cart.reduce((a, c) => a + c.quantity, 0)} user={user} />
        
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<HomePage products={products} addToCart={addToCart} />} />
            <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage items={cart} products={products} onUpdate={updateCart} onCheckout={checkout} />} />
            <Route path="/dashboard" element={<SellerDashboard products={products.filter(p => p.sellerId === user?.id)} onAddProduct={addProduct} onDeleteProduct={deleteProduct} />} />
            <Route path="/profile" element={
              <div className="py-8 space-y-8">
                <h1 className="text-3xl font-bold">Your Profile</h1>
                <div className="bg-white p-8 rounded-3xl border border-slate-200">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                       <UserIcon className="h-10 w-10" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-bold">{user?.name}</h2>
                       <p className="text-slate-500">{user?.email}</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg uppercase tracking-wider">{user?.role}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Order History</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map(o => (
                        <div key={o.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition">
                           <div className="flex items-center space-x-4">
                              <Package className="h-6 w-6 text-slate-400" />
                              <div>
                                 <p className="font-bold">Order #{o.id.toUpperCase()}</p>
                                 <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-indigo-600">${o.total.toFixed(2)}</p>
                              <span className="text-xs font-bold text-slate-400 uppercase">{o.status}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No orders placed yet.</p>
                  )}
                </div>
              </div>
            } />
          </Routes>
        </main>

        <AIAssistant products={products} />

        <footer className="bg-white border-t border-slate-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingBag className="h-6 w-6 text-indigo-600" />
                  <span className="text-xl font-bold">NexusMarket</span>
                </div>
                <p className="text-slate-500 max-w-xs">The future of distributed e-commerce. AI-powered, micro-service oriented, and user-first.</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Marketplace</h4>
                <ul className="space-y-2 text-slate-500 text-sm">
                  <li><Link to="/shop" className="hover:text-indigo-600">All Products</Link></li>
                  <li><Link to="/shop" className="hover:text-indigo-600">Featured Items</Link></li>
                  <li><Link to="/shop" className="hover:text-indigo-600">Categories</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-slate-500 text-sm">
                  <li className="hover:text-indigo-600 cursor-pointer">Privacy Policy</li>
                  <li className="hover:text-indigo-600 cursor-pointer">Terms of Service</li>
                  <li className="hover:text-indigo-600 cursor-pointer">Cookie Settings</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} NexusMarket Inc. All rights reserved. Built with Gemini AI.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
