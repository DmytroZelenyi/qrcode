'use client';

import { useState } from 'react';
import api from '../lib/axios';
import { Copy, Download, QrCode } from 'lucide-react';

interface QRGeneratorProps {
  onQRGenerated?: (qrImage: string, slug: string) => void;
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

export default function QRGenerator({ onQRGenerated }: QRGeneratorProps) {
  const [url, setUrl] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleGenerate = async () => {
    if (!url || !url.startsWith('http')) {
      setError('Enter a valid link');
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
      setError(err.response?.data?.error || 'Failed to generate QR code');
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
        <h2 className="text-2xl font-mono font-semibold mb-2">QR code generator</h2>
        <p className="text-[#9FB0C3] text-sm">Paste a link — get a dynamic QR code</p>
      </div>

      <div className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://instagram.com/yourprofile"
          className="w-full bg-[#16324F] border border-[#2A4A68] rounded-xl px-5 py-4 text-lg text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !url}
          className="relative group w-full bg-[#C4703F] text-[#0F2A4A] font-semibold py-4 rounded-xl text-lg hover:bg-[#D6875A] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <QrCode className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate QR'}
          <CornerMarks color="#0F2A4A" />
        </button>
      </div>

      {error && <p className="text-[#A8453A] text-sm">{error}</p>}

      {qrImage && (
        <div className="bg-[#16324F] border border-[#2A4A68] rounded-2xl p-6 text-center">
          <img src={qrImage} alt="QR Code" className="mx-auto w-64 h-64 rounded-xl mb-6" />

          <div className="flex gap-3 justify-center">
            <button
              onClick={downloadQR}
              className="relative group flex items-center gap-2 bg-[#C4703F] text-[#0F2A4A] px-6 py-3 rounded-xl hover:bg-[#D6875A] transition-colors duration-300"
            >
              <Download className="w-4 h-4" />
              Download
              <CornerMarks color="#0F2A4A" />
            </button>
            <button
              onClick={() => copyToClipboard(`${BACKEND_URL.replace(/\/$/, '')}/q/${slug}`)}
              className="relative group flex items-center gap-2 border border-[#2A4A68] px-6 py-3 rounded-xl hover:bg-[#0F2A4A] transition-colors duration-300"
            >
              <Copy className="w-4 h-4" />
              Copy
              <CornerMarks />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}