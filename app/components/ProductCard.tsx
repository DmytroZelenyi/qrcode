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

function CornerMarks({ color = '#C4703F' }: { color?: string }) {
  const base = 'pointer-events-none absolute w-3 h-3 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out';
  return (
    <>
      <span className={`${base} -top-px -left-px border-t-2 border-l-2`} style={{ borderColor: color }} />
      <span className={`${base} -top-px -right-px border-t-2 border-r-2 delay-30`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2 delay-30`} style={{ borderColor: color }} />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2 delay-60`} style={{ borderColor: color }} />
    </>
  );
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="relative group bg-[#16324F] border border-[#2A4A68] rounded-2xl overflow-hidden w-full max-w-70 hover:border-[#C4703F]/50 hover:-translate-y-1 transition-all duration-300 ease-out">
      <CornerMarks />
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-72 object-cover"
        />
        <div className="absolute top-3 right-3 bg-[#0F2A4A]/80 px-3 py-1 rounded-full text-xs font-mono text-[#ECE7DA]">
          {product.color}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-[#ECE7DA]">{product.name}</h3>
        <p className="text-[#9FB0C3] text-sm mb-4">{product.color}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-mono font-bold text-[#ECE7DA]">{product.price} ₴</span>
          <button
            onClick={() => onAddToCart(product)}
            className="relative group/btn bg-[#C4703F] text-[#0F2A4A] px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#D6875A] transition-colors duration-300"
          >
            <Plus className="w-4 h-4" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}