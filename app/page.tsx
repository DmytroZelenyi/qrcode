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

function CornerMarks({ color = '#C4703F', size = 10 }: { color?: string; size?: number }) {
  const base = 'pointer-events-none absolute w-2.5 h-2.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out';
  return (
    <>
      <span className={`${base} -top-px -left-px border-t-2 border-l-2`} style={{ borderColor: color, width: size, height: size }} />
      <span className={`${base} -top-px -right-px border-t-2 border-r-2 delay-30`} style={{ borderColor: color, width: size, height: size }} />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2 delay-30]`} style={{ borderColor: color, width: size, height: size }} />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2 delay-60`} style={{ borderColor: color, width: size, height: size }} />
    </>
  );
}

export default function QRWearApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'generator' | 'designer' | 'dashboard'>('shop');
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const cart = useCart();

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    api.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(() => {
        setProducts([
          { _id: '1', name: 'Classic Tee', color: 'Black', price: 890, image: 'https://picsum.photos/id/1015/600/600' },
        ]);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('shop');
  };

  const navBtn = (tab: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative group px-6 py-2 rounded-lg font-mono text-sm tracking-wide transition-colors duration-300 ${
        activeTab === tab ? 'bg-[#ECE7DA] text-[#0F2A4A]' : 'text-[#9FB0C3] hover:text-[#ECE7DA]'
      }`}
    >
      {label}
      <CornerMarks color={activeTab === tab ? '#0F2A4A' : '#C4703F'} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0F2A4A] text-[#ECE7DA] relative">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#ECE7DA 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      />

      <div className="max-w-6xl mx-auto p-6 relative">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C4703F] rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-[#0F2A4A]" />
            </div>
            <h1 className="text-3xl font-mono font-bold tracking-tight">QRWEAR</h1>
          </div>

          <div className="flex items-center gap-2">
            {navBtn('shop', 'Shop')}
            {isLoggedIn && (
              <>
                {navBtn('dashboard', 'Dashboard')}
                {navBtn('designer', 'Designer')}
              </>
            )}
            {navBtn('generator', 'Generator')}

            <button onClick={() => setShowCart(true)} className="relative group p-3 hover:bg-[#16324F] rounded-lg transition-colors duration-300">
              <ShoppingCart className="w-5 h-5" />
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#A8453A] text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono">
                  {cart.items.length}
                </span>
              )}
              <CornerMarks />
            </button>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="relative group flex items-center gap-2 px-4 py-2 bg-[#16324F] rounded-lg hover:bg-[#A8453A]/20 transition-colors duration-300">
                <LogOut className="w-4 h-4" /> Sign out
                <CornerMarks color="#A8453A" />
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} className="relative group flex items-center gap-2 px-6 py-2 bg-[#C4703F] text-[#0F2A4A] rounded-lg font-medium hover:bg-[#D6875A] transition-colors duration-300">
                <User className="w-4 h-4" /> Sign in
                <CornerMarks color="#0F2A4A" />
              </button>
            )}
          </div>
        </div>

        {activeTab === 'shop' && (
          <div>
            <h2 className="text-2xl font-mono mb-8 text-[#9FB0C3]">Choose your tee</h2>
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
            <p className="text-xl text-[#9FB0C3]">Sign in to access your dashboard and the designer.</p>
            <button
              onClick={() => setShowAuth(true)}
              className="relative group mt-6 px-8 py-3 bg-[#C4703F] text-[#0F2A4A] rounded-lg font-medium hover:bg-[#D6875A] transition-colors duration-300"
            >
              Sign in / Create account
              <CornerMarks color="#0F2A4A" />
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuth} onClose={() => { setShowAuth(false); setIsLoggedIn(true); }} onSuccess={(u) => { setUser(u); }} />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} cartItems={cart.items} removeFromCart={cart.removeFromCart} />
    </div>
  );
}