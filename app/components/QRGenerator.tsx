'use client';

import { useState } from 'react';
import api from '../lib/axios';
import { Copy, Download, QrCode } from 'lucide-react';

interface QRGeneratorProps {
  onQRGenerated?: (qrImage: string, slug: string) => void;
}

export default function QRGenerator({ onQRGenerated }: QRGeneratorProps) {
  const [url, setUrl] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleGenerate = async () => {
    if (!url || !url.startsWith('http')) {
      setError('Введіть коректне посилання');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/qr/create', {
        targetType: 'url',
        targetValue: url
      });

      const newQrImage = response.data.qrImage;
      const newSlug = response.data.qr.slug;

      setQrImage(newQrImage);
      setSlug(newSlug);

      if (onQRGenerated) {
        onQRGenerated(newQrImage, newSlug);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка генерації QR-коду');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qrwear-${slug || 'qr'}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2">Генератор QR-коду</h2>
        <p className="text-zinc-400">Вставте посилання — отримайте динамічний QR</p>
      </div>

      <div className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://instagram.com/yourprofile"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-white"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !url}
          className="w-full bg-white text-black font-semibold py-4 rounded-2xl text-lg hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <QrCode className="w-5 h-5" />
          {loading ? 'Генерація...' : 'Згенерувати QR'}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {qrImage && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <img src={qrImage} alt="QR Code" className="mx-auto w-64 h-64 rounded-xl mb-6" />
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl hover:bg-zinc-200"
            >
              <Download className="w-4 h-4" />
              Завантажити
            </button>
            <button
              onClick={() => copyToClipboard(`${BACKEND_URL.replace(/\/$/, '')}/q/${slug}`)}
              className="flex items-center gap-2 border border-zinc-700 px-6 py-3 rounded-2xl hover:bg-zinc-800"
            >
              <Copy className="w-4 h-4" />
              Скопіювати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}