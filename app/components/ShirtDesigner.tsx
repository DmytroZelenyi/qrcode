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
  image: string;           // mockup with QR
  designImage?: string;    // finished design as base64
  qrSlug?: string;
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

const CANVAS_W = 520;
const CANVAS_H = 620;

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
  const [scale, setScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new Canvas(canvasRef.current, {
        width: CANVAS_W,
        height: CANVAS_H,
        backgroundColor: '#0F2A4A',
      });
      fabricCanvasRef.current = canvas;
    }
  }, []);
  useEffect(() => {
    const updateScale = () => {
      const wrapperWidth = previewWrapperRef.current?.clientWidth ?? CANVAS_W;
      const next = Math.min(1, wrapperWidth / CANVAS_W);
      setScale(next);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!selectedProduct || !fabricCanvasRef.current) return;

    fabricCanvasRef.current.clear();

    FabricImage.fromURL(resolveImageUrl(selectedProduct.image), { crossOrigin: 'anonymous' })
      .then((img) => {
        img.scaleToWidth(CANVAS_W);
        img.selectable = false;
        fabricCanvasRef.current!.add(img);
        fabricCanvasRef.current!.centerObject(img);
      })
      .catch(err => console.error('Failed to load shirt:', err));
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
      alert(err.response?.data?.error || 'Failed to add QR');
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
      image: designImage,         
      designImage,
      qrSlug: qrSlug || undefined,
    };

    onAddToCart(cartItem);
    alert('Design with QR added to cart!');
    setDesignSaved(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Controls panel */}
      <div className="lg:w-96 space-y-6 order-1">
        <h2 className="text-2xl font-mono font-semibold">Designer</h2>

        <div>
          <p className="text-sm text-[#9FB0C3] mb-3">Choose a tee color</p>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => setSelectedProduct(p)}
                className={`relative group px-5 py-2.5 rounded-lg text-sm border transition-colors duration-300 ${
                  selectedProduct?._id === p._id
                    ? 'bg-[#ECE7DA] text-[#0F2A4A] border-[#ECE7DA]'
                    : 'border-[#2A4A68] hover:border-[#C4703F]/60 text-[#ECE7DA]'
                }`}
              >
                {p.color}
                <CornerMarks color={selectedProduct?._id === p._id ? '#0F2A4A' : '#C4703F'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#9FB0C3] mb-2">Link for QR</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            className="w-full bg-[#16324F] border border-[#2A4A68] rounded-xl px-4 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
          />
          <button
            onClick={addQRToCanvas}
            disabled={!url || loading || !selectedProduct}
            className="relative group mt-4 w-full bg-[#C4703F] text-[#0F2A4A] py-3.5 rounded-xl font-medium disabled:opacity-50 hover:bg-[#D6875A] transition-colors duration-300"
          >
            {loading ? 'Adding QR...' : 'Add QR to shirt'}
            <CornerMarks color="#0F2A4A" />
          </button>
        </div>

        {qrSlug && (
          <div className="text-[#8FB89A] text-sm">
            QR slug: <span className="font-mono">{qrSlug}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={exportDesign}
            disabled={!selectedProduct}
            className="relative group w-full bg-[#16324F] border border-[#2A4A68] hover:border-[#C4703F]/60 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-300"
          >
            <Download className="w-5 h-5" />
            Save design (PNG)
            <CornerMarks />
          </button>

          <button
            onClick={addToCartWithDesign}
            disabled={!selectedProduct || !qrSlug}
            className="relative group w-full bg-[#5C8A6A] hover:bg-[#6B9B79] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to cart with QR
            <CornerMarks color="#0F2A4A" />
          </button>
        </div>
      </div>

      <div
        ref={previewWrapperRef}
        className="flex-1 order-2 flex justify-center bg-[#16324F] border border-[#2A4A68] rounded-2xl p-4 sm:p-8 min-h-75 overflow-hidden"
      >
        <div
          className="relative shadow-2xl border border-[#2A4A68] rounded-xl overflow-hidden bg-[#0F2A4A]"
          style={{
            width: CANVAS_W * scale,
            height: CANVAS_H * scale,
          }}
        >
          <div
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <canvas ref={canvasRef} className="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}