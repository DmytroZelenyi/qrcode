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

function CornerMarks({ color = '#C4703F' }: { color?: string }) {
  const base = 'pointer-events-none absolute w-2.5 h-2.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out';
  return (
    <>
      <span className={`${base} -top-px -left-px border-t-2 border-l-2`} style={{ borderColor: color }} />
      <span className={`${base} -top-px -right-px border-t-2 border-r-2 delay-30`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2 delay-30`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2 delay-60`} style={{ borderColor: color }} />
    </>
  );
}

export default function CartModal({ isOpen, onClose, cartItems, removeFromCart }: CartModalProps) {
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleOrderSuccess = () => {
    cartItems.forEach(item => removeFromCart(item.id));
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0F2A4A]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#16324F] border border-[#2A4A68] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#2A4A68] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="text-xl font-mono font-semibold">Cart ({cartItems.length})</h3>
            </div>
            <button onClick={onClose} className="text-[#9FB0C3] hover:text-[#ECE7DA] transition-colors duration-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-[#9FB0C3]">
                <ShoppingCart className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="relative group flex gap-4 bg-[#0F2A4A] border border-[#2A4A68] p-4 rounded-xl hover:border-[#C4703F]/40 transition-colors duration-300">
                    <CornerMarks />
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-[#9FB0C3] text-sm">{item.color}</p>
                      <p className="font-mono font-bold mt-1">{item.price} ₴</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A8453A] hover:text-[#C85F51] self-start mt-1 transition-colors duration-300"
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
            <div className="p-6 border-t border-[#2A4A68]">
              <div className="flex justify-between items-center text-lg font-semibold mb-6">
                <span>Total:</span>
                <span className="font-mono">{total} ₴</span>
              </div>

              <button
                onClick={() => setShowOrderModal(true)}
                className="relative group w-full bg-[#C4703F] text-[#0F2A4A] py-4 rounded-lg font-semibold text-lg hover:bg-[#D6875A] transition-colors duration-300"
              >
                Checkout
                <CornerMarks color="#0F2A4A" />
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