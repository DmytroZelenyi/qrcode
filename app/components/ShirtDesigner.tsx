'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { Download, ShoppingCart } from 'lucide-react';
import api from '../lib/axios';

interface Product {
  _id: string;
  name: string;
  color: string;
  price: number;
  image: string;
}

interface CartItem {
  id: string;
  name: string;
  color: string;
  price: number;
  image: string;           // mockup з QR
  designImage?: string;    // base64 готового дизайну
  qrSlug?: string;
}

export default function ShirtDesigner({ 
  products, 
  onAddToCart 
}: { 
  products: Product[]; 
  onAddToCart: (item: CartItem) => void;
}) {
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [url, setUrl] = useState('');
  const [qrSlug, setQrSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  // Ініціалізація Canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new Canvas(canvasRef.current, {
        width: 520,
        height: 620,
        backgroundColor: '#111111',
      });
      fabricCanvasRef.current = canvas;
    }
  }, []);

  // Завантаження футболки
  useEffect(() => {
    if (!selectedProduct || !fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();

    FabricImage.fromURL(resolveImageUrl(selectedProduct.image), { crossOrigin: 'anonymous' })
      .then((img) => {
        img.scaleToWidth(520);
        img.selectable = false;
        fabricCanvasRef.current!.add(img);
        fabricCanvasRef.current!.centerObject(img);
      })
      .catch(err => console.error('Не вдалося завантажити футболку:', err));
  }, [selectedProduct]);

  const resolveImageUrl = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`;

  const addQRToCanvas = async () => {
    if (!url || !fabricCanvasRef.current || !selectedProduct) return;
    setLoading(true);

    try {
      const res = await api.post('/api/qr/create', {
        targetType: 'url',
        targetValue: url,
      });

      setQrSlug(res.data.qr.slug);

      const qrImg = await FabricImage.fromURL(res.data.qrImage, { crossOrigin: 'anonymous' });
      qrImg.scale(0.48);
      qrImg.set({ 
        left: 170, 
        top: 230,
        cornerSize: 12,
        transparentCorners: false
      });

      fabricCanvasRef.current.add(qrImg);
      fabricCanvasRef.current.setActiveObject(qrImg);
      setDesignSaved(false);

    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка додавання QR');
    } finally {
      setLoading(false);
    }
  };

  const exportDesign = () => {
    if (!fabricCanvasRef.current) return;
    const dataUrl = fabricCanvasRef.current.toDataURL({ multiplier: 1, format: 'png', quality: 0.95 });
    
    const link = document.createElement('a');
    link.download = `qrwear-${qrSlug || 'design'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const addToCartWithDesign = () => {
    if (!selectedProduct || !fabricCanvasRef.current) return;

    const designImage = fabricCanvasRef.current.toDataURL({ multiplier: 1, format: 'png', quality: 0.9 });

    const cartItem: CartItem = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      color: selectedProduct.color,
      price: selectedProduct.price,
      image: designImage,           // готовий дизайн з QR
      designImage,
      qrSlug: qrSlug || undefined,
    };

    onAddToCart(cartItem);
    alert('Дизайн з QR успішно додано в кошик!');
    setDesignSaved(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Панель керування */}
      <div className="lg:w-96 space-y-6">
        <h2 className="text-3xl font-semibold">Конструктор</h2>

        <div>
          <p className="text-sm text-zinc-400 mb-3">Оберіть колір футболки</p>
          <div className="flex flex-wrap gap-3">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelectedProduct(p)}
                className={`px-5 py-2.5 rounded-2xl text-sm border transition-all ${
                  selectedProduct?._id === p._id 
                    ? 'bg-white text-black border-white' 
                    : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {p.color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Посилання для QR</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 focus:border-white"
          />
          <button
            onClick={addQRToCanvas}
            disabled={!url || loading || !selectedProduct}
            className="mt-4 w-full bg-white text-black py-3.5 rounded-2xl font-medium disabled:opacity-50"
          >
            {loading ? 'Додавання QR...' : 'Додати QR на футболку'}
          </button>
        </div>

        {qrSlug && (
          <div className="text-emerald-400 text-sm">
            QR Slug: <span className="font-mono">{qrSlug}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={exportDesign}
            disabled={!selectedProduct}
            className="w-full bg-zinc-700 hover:bg-zinc-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Зберегти дизайн (PNG)
          </button>

          <button
            onClick={addToCartWithDesign}
            disabled={!selectedProduct || !qrSlug}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-5 h-5" />
            Додати в кошик з QR
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex justify-center bg-zinc-900 rounded-3xl p-8 min-h-[650px]">
        <div className="relative shadow-2xl border border-zinc-700 rounded-2xl overflow-hidden bg-black">
          <canvas ref={canvasRef} className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}