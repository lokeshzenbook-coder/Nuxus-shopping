import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  User as UserIcon,
  Search,
  Menu,
  X,
  Bot,
  ArrowRight,
  PlusCircle,
  Package,
  CheckCircle,
  CreditCard,
  Trash2,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  Zap,
  Flame,
  Send,
  Wallet,
  Boxes,
  Timer,
  Globe,
  Mail,
  MessageCircle,
  Rss,
  type LucideIcon,
} from 'lucide-react';

import { Product, Category, User, CartItem, Order, ChatMessage } from './types';
import { CATEGORIES } from './constants';
import { ProductService, OrderService } from './apiService';
import { getShoppingAdvice, generateProductDescription } from './geminiService';

// --- Components ---

const Navbar = ({ cartCount, user }: { cartCount: number, user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLink = (path: string, label: string) => (
    <Link
      key={path}
      to={path}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
        location.pathname === path
          ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600'
          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
      }`}
    >
      {label}
    </Link>
  );

  const cartBadge = cartCount > 0 ? (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
      {cartCount}
    </span>
  ) : null;

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold tracking-wide sm:px-6 lg:px-8">
          <Truck className="h-3.5 w-3.5 shrink-0" />
          <span>Free shipping on orders over $50</span>
          <span className="hidden text-white/60 sm:inline">·</span>
          <span className="hidden text-white/80 sm:inline">Ask Nexus AI for instant recommendations</span>
        </div>
      </div>

      <nav className="glass border-b border-slate-200/60 shadow-[0_10px_40px_-15px_rgba(15,23,42,0.25)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="group flex items-center space-x-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-300/60 transition-transform duration-200 group-hover:rotate-3 group-hover:scale-105">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
                Nexus<span className="text-gradient">Market</span>
              </span>
            </Link>

            <div className="hidden items-center space-x-2 md:flex">
              {navLink('/shop', 'Shop')}
              {user?.role === 'seller' && navLink('/dashboard', 'Seller Panel')}
            </div>

            <div className="hidden items-center space-x-1 md:flex">
              <Link to="/cart" className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100/70 hover:text-indigo-600">
                <ShoppingCart className="h-6 w-6" />
                {cartBadge}
              </Link>
              <Link to="/profile" className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100/70 hover:text-indigo-600">
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>

            <div className="flex items-center space-x-3 md:hidden">
              <Link to="/cart" className="relative p-2 text-slate-600">
                <ShoppingCart className="h-6 w-6" />
                {cartBadge}
              </Link>
              <button onClick={() => setIsOpen(!isOpen)} className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="animate-fade-up space-y-1 border-t border-slate-200/60 bg-white/90 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">
              Shop
            </Link>
            {user?.role === 'seller' && (
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">
                Seller Panel
              </Link>
            )}
            <Link to="/profile" onClick={() => setIsOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">
              Profile
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, addToCart: (p: Product) => void }> = ({ product, addToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group card-shadow card-shadow-hover relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white hover:-translate-y-1.5">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
          {product.category}
        </span>
        {product.rating > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {product.rating.toFixed(1)}
          </span>
        )}
        {product.stock < 15 && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
            <Flame className="h-3 w-3" /> Only {product.stock} left
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
          {product.name}
        </h3>
        <p className="mt-1 flex-1 text-sm text-slate-500 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Price</p>
            <p className="font-display text-xl font-extrabold text-slate-900">${product.price.toFixed(2)}</p>
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
              added
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300'
            }`}
          >
            {added ? <CheckCircle className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            <span>{added ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="glass-strong animate-fade-up mb-4 flex h-[500px] w-80 flex-col overflow-hidden rounded-3xl shadow-2xl md:w-96">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-4 text-white">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Bot className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-indigo-600" />
              </span>
              <div>
                <p className="text-sm font-bold">Nexus AI Assistant</p>
                <p className="text-[11px] text-white/70">Online - replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 transition hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="custom-scroll flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                    <Bot className="h-4 w-4" />
                  </span>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                    : 'rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.15s' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200/70 bg-white/60 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Suggest a smartphone..."
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-2.5 text-white shadow-lg shadow-indigo-200 transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative animate-float group flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-4 text-white shadow-2xl shadow-indigo-300/60 transition-transform hover:scale-105"
        >
          <span aria-hidden="true" className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-50 blur-md animate-pulse" />
          <span className="relative flex items-center gap-3">
            <Bot className="h-7 w-7" />
            <span className="hidden text-sm font-bold sm:block">Ask Nexus AI</span>
          </span>
        </button>
      )}
    </div>
  );
};

// --- Pages ---

const HomePage = ({ products, addToCart }: { products: Product[], addToCart: (p: Product) => void }) => (
  <div className="space-y-20 py-10">
    {/* Hero */}
    <section className="bg-hero relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-white sm:px-12 md:px-16 md:py-20">
      <div className="bg-grid absolute inset-0" />
      <div className="blob animate-blob absolute -left-20 -top-20 h-80 w-80 bg-indigo-500/40" />
      <div className="blob animate-blob absolute -bottom-24 right-0 h-96 w-96 bg-fuchsia-500/40" style={{ animationDelay: '2s' }} />
      <div className="blob animate-blob absolute -bottom-16 left-1/3 h-72 w-72 bg-sky-400/30" style={{ animationDelay: '4s' }} />

      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            AI-POWERED MARKETPLACE
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
            Next-Gen Commerce,<br />
            <span className="text-gradient-light">Beautifully Simplified.</span>
          </h1>
          <p className="max-w-lg text-base text-slate-300 md:text-lg">
            Discover a curated marketplace of world-class products. Shop smarter with Nexus AI, or sell and grow your own brand.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-8 py-4 font-bold text-white shadow-xl shadow-indigo-950/50 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-fuchsia-500/40"
            >
              Start Shopping
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition-all hover:bg-white/20"
            >
              Become a Seller
            </Link>
          </div>
          <div className="grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div>
              <p className="font-display text-2xl font-extrabold text-white">50K+</p>
              <p className="text-xs text-slate-400">Curated products</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-white">10K+</p>
              <p className="text-xs text-slate-400">Verified sellers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-white">4.9<span className="text-amber-300">&#9733;</span></p>
              <p className="text-xs text-slate-400">Average rating</p>
            </div>
          </div>
        </div>

        <div className="relative hidden h-[420px] lg:block">
          <div className="animate-float absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl shadow-indigo-950/40 ring-1 ring-white/40">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
              <Bot className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Nexus AI</p>
              <p className="text-xs font-semibold text-green-600">Online - ask me anything</p>
            </div>
          </div>
          {products.slice(0, 4).map((p, i) => {
            const positions = [
              'left-0 top-4 w-48 -rotate-6',
              'right-0 top-0 w-40 rotate-3',
              'left-8 top-64 w-44 rotate-2',
              'right-6 top-56 w-52 -rotate-3',
            ];
            return (
              <div
                key={p.id}
                className={`${positions[i]} ${i % 2 === 0 ? 'animate-float' : 'animate-float-slow'} absolute rounded-2xl bg-white/90 p-3 shadow-2xl shadow-indigo-950/40 ring-1 ring-white/50 backdrop-blur`}
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <img src={p.imageUrl} alt={p.name} className="h-20 w-full rounded-xl object-cover" />
                <p className="mt-2 truncate text-xs font-bold text-slate-800">{p.name}</p>
                <p className="text-xs font-semibold text-indigo-600">${p.price.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Trust strip */}
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[
        { icon: Truck, title: 'Free Fast Delivery', desc: 'Free shipping over $50' },
        { icon: ShieldCheck, title: 'Secure Payments', desc: '256-bit encrypted checkout' },
        { icon: Sparkles, title: 'AI Shopping Coach', desc: 'Instant recommendations' },
        { icon: Zap, title: 'Instant Checkout', desc: 'One-click, zero friction' },
      ].map((f) => (
        <div key={f.title} className="card-shadow card-shadow-hover group flex items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 transition-colors group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white">
            <f.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-slate-900">{f.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{f.desc}</p>
          </div>
        </div>
      ))}
    </section>

    {/* Categories */}
    <section>
      <div className="mb-8">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
          <Zap className="h-4 w-4" /> Shop by category
        </p>
        <div className="mt-2 flex items-end justify-between">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Browse Trending Categories</h2>
          <Link to="/shop" className="hidden items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700 sm:inline-flex">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {['All', ...CATEGORIES].map((c, i) => (
          <Link
            key={c}
            to={c === 'All' ? '/shop' : `/shop?cat=${encodeURIComponent(c)}`}
            className={`group flex min-w-[150px] items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
              i === 0
                ? 'border-transparent bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                : 'border-slate-100 bg-white text-slate-700 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100'
            }`}
          >
            <span className="font-display font-bold">{c}</span>
            <ArrowRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>

    {/* Featured */}
    <section>
      <div className="mb-8">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-indigo-600">
          <Flame className="h-4 w-4" /> Featured
        </p>
        <div className="mt-2 flex items-end justify-between">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">Trending Right Now</h2>
          <Link to="/shop" className="group inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="mt-2 text-slate-500">Handpicked items popular right now</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map(p => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </div>
    </section>
  </div>
);

const ShopPage = ({ products, addToCart }: { products: Product[], addToCart: (p: Product) => void }) => {
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const rawFilter = searchParams.get('cat') ?? 'All';
  const filter = CATEGORIES.includes(rawFilter as Category) ? rawFilter : 'All';

  const filtered = products.filter(p =>
    (filter === 'All' || p.category === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const setFilter = (cat: string) => setSearchParams(cat === 'All' ? {} : { cat });

  return (
    <div className="space-y-8 py-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white md:p-12">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" /> EXPLORE THE MARKETPLACE
          </span>
          <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Marketplace</h1>
          <p className="mt-2 max-w-xl text-white/80">Handpicked products from the best sellers - find your next favourite.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-white/20 bg-white py-3.5 pl-11 pr-4 text-slate-800 shadow-lg placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold backdrop-blur">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {['All', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              filter === c
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/60 py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Search className="h-8 w-8" />
          </span>
          <p className="font-display mt-4 text-xl font-bold text-slate-800">No products found</p>
          <p className="mt-1 text-slate-500">Try a different keyword or category.</p>
          <button
            onClick={() => { setSearch(''); setFilter('All'); }}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

const FREE_SHIPPING_THRESHOLD = 50;

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
  const count = cartDetails.reduce((acc, c) => acc + c.quantity, 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  if (items.length === 0) return (
    <div className="space-y-6 py-24 text-center">
      <span className="animate-float mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600">
        <ShoppingCart className="h-12 w-12" />
      </span>
      <h2 className="font-display text-3xl font-extrabold text-slate-900">Your cart is empty</h2>
      <p className="mx-auto max-w-xs text-slate-500">Looks like you haven't added anything yet - let's fix that.</p>
      <Link to="/shop" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl">
        Start Shopping <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );

  return (
    <div className="grid gap-8 py-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-600">{count} items</span>
        </div>

        {remaining > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <Truck className="h-4 w-4" /> You're ${remaining.toFixed(2)} away from free shipping
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {cartDetails.map(item => (
          <div key={item.productId} className="card-shadow card-shadow-hover flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 sm:gap-5 sm:p-5">
            <img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display truncate font-bold text-slate-900">{item.product.name}</h3>
              <p className="mt-0.5 text-sm text-slate-500">${item.product.price.toFixed(2)} each</p>
              <button onClick={() => onUpdate(item.productId, 0)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <button onClick={() => onUpdate(item.productId, item.quantity - 1)} className="h-9 w-9 text-slate-600 transition hover:bg-slate-100">-</button>
                <span className="w-9 text-center font-bold text-slate-900">{item.quantity}</span>
                <button onClick={() => onUpdate(item.productId, item.quantity + 1)} className="h-9 w-9 text-slate-600 transition hover:bg-slate-100">+</button>
              </div>
            </div>
            <p className="font-display min-w-[70px] text-right text-lg font-extrabold text-slate-900">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="card-shadow sticky top-28 overflow-hidden rounded-3xl border border-slate-100 bg-white">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5">
            <h2 className="font-display text-lg font-extrabold text-white">Order Summary</h2>
          </div>
          <div className="p-8">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({count} items)</span>
                <span className="font-semibold text-slate-800">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">{remaining === 0 ? 'Free' : '$4.99'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 font-display text-xl font-extrabold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl"
            >
              <CreditCard className="h-5 w-5" /> Checkout Now
            </button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Secure 256-bit encrypted checkout
            </p>
          </div>
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
    } catch (e) {}
    finally { setIsGenerating(false); }
  };

  const stats: { label: string; value: string; note: string; icon: LucideIcon; gradient: string }[] = [
    { label: 'Total Revenue', value: '$12,450.00', note: '+12% vs last month', icon: Wallet, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Active Listings', value: String(products.length), note: 'Across all categories', icon: Boxes, gradient: 'from-indigo-500 to-violet-500' },
    { label: 'Pending Orders', value: '14', note: 'Awaiting fulfilment', icon: Timer, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-8 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Seller Dashboard</h1>
          <p className="mt-1 text-slate-500">Manage your inventory and track performance.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl">
          <PlusCircle className="h-5 w-5" /> New Product
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="card-shadow card-shadow-hover flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-6">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}>
              <s.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-500">{s.label}</p>
              <p className="font-display text-2xl font-extrabold text-slate-900">{s.value}</p>
              <p className="truncate text-xs text-slate-400">{s.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-shadow overflow-hidden rounded-3xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 p-6">
          <h2 className="font-display text-xl font-extrabold text-slate-900">Inventory Management</h2>
          <p className="mt-0.5 text-sm text-slate-500">Manage your live product listings.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="h-11 w-11 rounded-xl object-cover" />
                      <span className="font-semibold text-slate-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.category}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      p.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {p.stock < 5 && <Flame className="h-3 w-3" />}
                      {p.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDeleteProduct(p.id)} className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-up w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5 text-white">
              <div>
                <h2 className="font-display text-xl font-extrabold">Create New Listing</h2>
                <p className="text-xs text-white/70">Add a product to your storefront</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="rounded-lg p-1.5 transition hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Product Name</label>
                <input
                  value={newP.name}
                  onChange={e => setNewP({ ...newP, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. Vintage Camera"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Price ($)</label>
                  <input
                    type="number"
                    value={newP.price}
                    onChange={e => setNewP({ ...newP, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Stock Level</label>
                  <input
                    type="number"
                    value={newP.stock}
                    onChange={e => setNewP({ ...newP, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select
                  value={newP.category}
                  onChange={e => setNewP({ ...newP, category: e.target.value as Category })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={generateAI}
                disabled={!newP.name || isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:opacity-50"
              >
                {isGenerating ? 'AI is writing...' : <><Bot className="h-4 w-4" /> Enhance with AI</>}
              </button>
            </div>
            <div className="flex gap-3 border-t border-slate-100 p-6">
              <button onClick={() => setIsAdding(false)} className="flex-1 rounded-2xl border border-slate-200 py-3 font-bold text-slate-500 transition hover:text-slate-700">
                Cancel
              </button>
              <button onClick={handleAdd} className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl">
                List Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail('');
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-400">
        <CheckCircle className="h-4 w-4" /> Subscribed! Welcome to Nexus.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      />
      <button type="submit" className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:shadow-xl">
        Subscribe
      </button>
    </form>
  );
};

const Footer = () => (
  <footer className="relative mt-24 overflow-hidden bg-slate-950 text-slate-300">
    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-sky-400" />
    <div className="bg-grid absolute inset-0 opacity-20" />
    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              Nexus<span className="text-gradient-light">Market</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm text-slate-400">
            The future of distributed e-commerce. AI-powered, micro-service oriented, and user-first.
          </p>
          <div className="flex gap-3">
            {[Globe, Mail, MessageCircle, Rss].map((Icon, i) => (
              <a
                key={i}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:from-indigo-500 hover:to-fuchsia-500 hover:bg-gradient-to-br hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display mb-4 font-bold text-white">Marketplace</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/shop" className="text-slate-400 transition hover:text-indigo-400">All Products</Link></li>
            <li><Link to="/shop?cat=Electronics" className="text-slate-400 transition hover:text-indigo-400">Electronics</Link></li>
            <li><Link to="/shop?cat=Fashion" className="text-slate-400 transition hover:text-indigo-400">Fashion</Link></li>
            <li><Link to="/shop?cat=Home%20%26%20Garden" className="text-slate-400 transition hover:text-indigo-400">Home &amp; Garden</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display mb-4 font-bold text-white">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/profile" className="text-slate-400 transition hover:text-indigo-400">My Orders</Link></li>
            <li><Link to="/profile" className="text-slate-400 transition hover:text-indigo-400">Track Order</Link></li>
            <li><Link to="/dashboard" className="text-slate-400 transition hover:text-indigo-400">Sell on Nexus</Link></li>
            <li><span className="cursor-pointer text-slate-400 transition hover:text-indigo-400">Help Center</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display mb-4 font-bold text-white">Stay in the loop</h4>
          <p className="mb-4 text-sm text-slate-400">Get exclusive deals and product drops in your inbox.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} NexusMarket Inc. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <span className="cursor-pointer text-slate-500 transition hover:text-slate-300">Privacy Policy</span>
          <span className="cursor-pointer text-slate-500 transition hover:text-slate-300">Terms of Service</span>
          <span className="cursor-pointer text-slate-500 transition hover:text-slate-300">Cookies</span>
        </div>
      </div>
    </div>
  </footer>
);

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-50">
      <span className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-xl shadow-indigo-200">
        <ShoppingBag className="h-7 w-7" />
      </span>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: '0.12s' }} />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-fuchsia-500" style={{ animationDelay: '0.24s' }} />
      </div>
      <p className="font-display animate-pulse text-sm font-bold text-slate-500">Initializing Nexus engines...</p>
    </div>
  );

  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar cartCount={cart.reduce((a, c) => a + c.quantity, 0)} user={user} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage products={products} addToCart={addToCart} />} />
            <Route path="/shop" element={<ShopPage products={products} addToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage items={cart} products={products} onUpdate={updateCart} onCheckout={checkout} />} />
            <Route path="/dashboard" element={<SellerDashboard products={products.filter(p => p.sellerId === user?.id)} onAddProduct={addProduct} onDeleteProduct={deleteProduct} />} />
            <Route path="/profile" element={
              <div className="space-y-8 py-10">
                <div className="flex items-center gap-5">
                  <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-200">
                    <UserIcon className="h-10 w-10" />
                  </span>
                  <div>
                    <h1 className="font-display text-3xl font-extrabold text-slate-900">{user?.name}</h1>
                    <p className="text-slate-500">{user?.email}</p>
                    <span className="mt-2 inline-block rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="card-shadow rounded-3xl border border-slate-100 bg-white p-8">
                  <h2 className="font-display mb-6 flex items-center gap-2 text-xl font-extrabold text-slate-900">
                    <Package className="h-5 w-5 text-indigo-600" /> Order History
                  </h2>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map(o => (
                        <div key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-5 transition-colors hover:bg-slate-50/70">
                          <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                              <Package className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">Order #{o.id.toUpperCase()}</p>
                              <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-extrabold text-indigo-600">${o.total.toFixed(2)}</p>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                              o.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {o.status}
                            </span>
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
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
