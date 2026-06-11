'use client';

import { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import OrderModal from './OrderModal';
interface CartItem {
  id: string;
  name: string;
  color: string;
  price: number;
  image: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
}

export default function CartModal({ isOpen, onClose, cartItems, removeFromCart }: CartModalProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleOrderSuccess = () => {
    // Очищаємо кошик після успішного замовлення
    cartItems.forEach(item => removeFromCart(item.id));
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <h3 className="text-2xl font-semibold">Кошик ({cartItems.length})</h3>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-xl">Кошик порожній</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-zinc-800 p-4 rounded-2xl">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-zinc-400 text-sm">{item.color}</p>
                      <p className="font-bold mt-1">{item.price} ₴</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 self-start mt-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-zinc-700">
              <div className="flex justify-between items-center text-xl font-semibold mb-6">
                <span>Разом:</span>
                <span>{total} ₴</span>
              </div>
              
              <button 
                onClick={() => setShowOrderModal(true)}
                className="w-full bg-white text-black py-4 rounded-2xl font-semibold text-lg hover:bg-zinc-200 transition"
              >
                Оформити замовлення
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal 
        isOpen={showOrderModal} 
        onClose={() => setShowOrderModal(false)} 
        cartItems={cartItems} 
        total={total}
        onOrderSuccess={handleOrderSuccess}
      />
    </>
  );
}