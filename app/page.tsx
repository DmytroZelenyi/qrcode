'use client';

import { useState, useEffect } from 'react';
import { QrCode, ShoppingCart, LogOut, User } from 'lucide-react';
import { create } from 'zustand';
import api from './lib/axios';
import { getToken } from './lib/auth';

import AuthModal from './components/AuthModal';
import QRGenerator from './components/QRGenerator';
import ShirtDesigner from './components/ShirtDesigner';
import ProductCard from './components/ProductCard';
import CartModal from './components/CartModal';
import Dashboard from './components/Dashboard';

const useCart = create<any>((set) => ({
  items: [],
  addToCart: (product: any) => set((state: any) => ({ items: [...state.items, { ...product, id: Date.now().toString() }] })),
  removeFromCart: (id: string) => set((state: any) => ({ items: state.items.filter((item: any) => item.id !== id) })),
}));

interface Product { _id: string; name: string; color: string; price: number; image: string; }

export default function QRWearApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'generator' | 'designer' | 'dashboard'>('shop');
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const cart = useCart();

  // Перевірка авторизації
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      // Можна завантажити дані користувача
    }
  }, []);

  // Завантаження товарів
  useEffect(() => {
    api.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(() => {
        setProducts([
          { _id: '1', name: 'Classic Tee', color: 'Чорний', price: 890, image: 'https://picsum.photos/id/1015/600/600' },
          // ... інші
        ]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('shop');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-bold">QRWear</h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('shop')} className={`px-6 py-2 rounded-2xl ${activeTab === 'shop' ? 'bg-white text-black' : 'text-zinc-400'}`}>Магазин</button>
            {isLoggedIn && (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2 rounded-2xl ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-zinc-400'}`}>Мій кабінет</button>
                <button onClick={() => setActiveTab('designer')} className={`px-6 py-2 rounded-2xl ${activeTab === 'designer' ? 'bg-white text-black' : 'text-zinc-400'}`}>Конструктор</button>
              </>
            )}
            <button onClick={() => setActiveTab('generator')} className={`px-6 py-2 rounded-2xl ${activeTab === 'generator' ? 'bg-white text-black' : 'text-zinc-400'}`}>Генератор</button>

            <button onClick={() => setShowCart(true)} className="relative p-3 hover:bg-zinc-900 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
              {cart.items.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">{cart.items.length}</span>}
            </button>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-2xl hover:bg-red-600/20">
                <LogOut className="w-5 h-5" /> Вийти
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-2xl font-medium">
                <User /> Увійти
              </button>
            )}
          </div>
        </div>

        {/* Контент */}
        {activeTab === 'shop' && (
          <div>
            <h2 className="text-3xl font-semibold mb-8">Оберіть футболку</h2>
            <div className="flex flex-wrap gap-6 justify-center">
              {products.map(p => <ProductCard key={p._id} product={p} onAddToCart={cart.addToCart} />)}
            </div>
          </div>
        )}

        {activeTab === 'generator' && <QRGenerator />}
        {activeTab === 'designer' && isLoggedIn && (
  <ShirtDesigner products={products} onAddToCart={cart.addToCart} />
)}
        {activeTab === 'dashboard' && isLoggedIn && <Dashboard />}

        {!isLoggedIn && (activeTab === 'designer' || activeTab === 'dashboard') && (
          <div className="text-center py-20">
            <p className="text-2xl">Увійдіть, щоб користуватися кабінетом та конструктором</p>
            <button onClick={() => setShowAuth(true)} className="mt-6 px-8 py-3 bg-white text-black rounded-2xl">Увійти / Зареєструватися</button>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => { setShowAuth(false); setIsLoggedIn(true); }} onSuccess={(u) => { setUser(u); }} />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} cartItems={cart.items} removeFromCart={cart.removeFromCart} />
    </div>
  );
}