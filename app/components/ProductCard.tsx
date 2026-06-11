'use client';

import { Plus } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  color: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden w-full max-w-[280px] hover:border-white/30 transition group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-72 object-cover"
        />
        <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-sm">
          {product.color}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-zinc-400 text-sm mb-4">{product.color}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{product.price} ₴</span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-white text-black px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-zinc-200 transition"
          >
            <Plus className="w-4 h-4" />
            В кошик
          </button>
        </div>
      </div>
    </div>
  );
}