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

      alert('Замовлення успішно оформлено!');
      onOrderSuccess();
      onClose();
    } catch (err) {
      alert('Помилка оформлення замовлення');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-auto">
        <div className="p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold">Оформлення замовлення</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Товари ({cartItems.length})</h3>
            {cartItems.map((item, i) => (
              <div key={i} className="flex gap-3 bg-zinc-800 p-3 rounded-2xl mb-3">
                <img src={item.image} className="w-16 h-16 object-cover rounded-xl" />
                <div>
                  <p>{item.name} — {item.color}</p>
                  <p className="font-bold">{item.price} ₴</p>
                </div>
              </div>
            ))}
            <div className="text-right text-xl font-bold mt-4">Разом: {total} ₴</div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Дані для доставки</h3>
            <input type="text" placeholder="ПІБ" required className="w-full bg-zinc-800 rounded-2xl px-5 py-3" onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})} />
            <input type="text" placeholder="Адреса доставки" required className="w-full bg-zinc-800 rounded-2xl px-5 py-3" onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} />
            <input type="tel" placeholder="Телефон" required className="w-full bg-zinc-800 rounded-2xl px-5 py-3" onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} />
            <input type="email" placeholder="Email" required className="w-full bg-zinc-800 rounded-2xl px-5 py-3" onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
          >
            {loading ? 'Оформлення...' : `Оплатити ${total} ₴`}
          </button>
        </form>

        <button onClick={onClose} className="w-full py-4 text-zinc-400">Скасувати</button>
      </div>
    </div>
  );
}