'use client';

import { useState } from 'react';
import api from '../lib/axios';

interface CartItem {
  name: string;
  color: string;
  price: number;
  image: string;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onOrderSuccess: () => void;
}

// Signature motif: viewfinder corner marks that resolve into focus on hover.
function CornerMarks({ color = '#C4703F' }: { color?: string }) {
  const base = 'pointer-events-none absolute w-2.5 h-2.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out';
  return (
    <>
      <span className={`${base} -top-px -left-px border-t-2 border-l-2`} style={{ borderColor: color }} />
      <span className={`${base} -top-px -right-px border-t-2 border-r-2 delay-30]`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2 delay-30`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2 delay-60`} style={{ borderColor: color }} />
    </>
  );
}

export default function OrderModal({ isOpen, onClose, cartItems, total, onOrderSuccess }: OrderModalProps) {
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/orders', {
        items: cartItems,
        total,
        shippingInfo
      });

      alert('Order placed successfully!');
      onOrderSuccess();
      onClose();
    } catch (err) {
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F2A4A]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#16324F] border border-[#2A4A68] rounded-2xl w-full max-w-lg max-h-[95vh] overflow-auto">
        <div className="p-6 border-b border-[#2A4A68]">
          <h2 className="text-xl font-mono font-bold">Checkout</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-[#9FB0C3] text-sm uppercase tracking-wide">Items ({cartItems.length})</h3>
            {cartItems.map((item, i) => (
              <div key={i} className="flex gap-3 bg-[#0F2A4A] border border-[#2A4A68] p-3 rounded-xl mb-3">
                <img src={item.image} className="w-16 h-16 object-cover rounded-lg" alt={item.name} />
                <div>
                  <p>{item.name} — {item.color}</p>
                  <p className="font-mono font-bold">{item.price} ₴</p>
                </div>
              </div>
            ))}
            <div className="text-right text-lg font-semibold mt-4">
              Total: <span className="font-mono">{total} ₴</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[#9FB0C3] text-sm uppercase tracking-wide">Shipping details</h3>
            <input
              type="text"
              placeholder="Full name"
              required
              className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
              onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Shipping address"
              required
              className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone"
              required
              className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
              onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              required
              className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative group w-full bg-[#C4703F] text-[#0F2A4A] py-4 rounded-lg font-semibold text-lg disabled:opacity-50 hover:bg-[#D6875A] transition-colors duration-300"
          >
            {loading ? 'Placing order...' : `Pay ${total} ₴`}
            <CornerMarks color="#0F2A4A" />
          </button>
        </form>

        <button onClick={onClose} className="w-full py-4 text-[#9FB0C3] hover:text-[#ECE7DA] transition-colors duration-300">
          Cancel
        </button>
      </div>
    </div>
  );
}