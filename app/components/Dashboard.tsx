'use client';

import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Copy, QrCode, Eye, Trash2 } from 'lucide-react';

interface QR {
  _id: string;
  slug: string;
  targetType: string;
  targetValue: string;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
}

export default function Dashboard() {
  const [qrs, setQrs] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchMyQRs = async () => {
    try {
      const res = await api.get('/api/qr/my');
      setQrs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQRs();
  }, []);

  const toggleQR = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/api/qr/${id}`, { isActive: !currentStatus });
      fetchMyQRs();
    } catch (err) {
      alert('Помилка оновлення статусу');
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${BACKEND_URL.replace(/\/$/, '')}/q/${slug}`);
    alert('Посилання скопійовано!');
  };

  if (loading) return <p className="text-center py-10">Завантаження...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold">Мої QR-коди</h2>
        <p className="text-zinc-400">Керуйте своїми динамічними QR</p>
      </div>

      {qrs.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 rounded-3xl">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <p className="text-xl">У вас ще немає QR-кодів</p>
          <p className="text-zinc-500 mt-2">Перейдіть у конструктор або генератор, щоб створити перший</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qrs.map(qr => (
            <div key={qr._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <code className="text-2xl font-mono text-emerald-400">{qr.slug}</code>
                  <p className="text-sm text-zinc-500 mt-1">
                    {new Date(qr.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${qr.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {qr.isActive ? 'Активний' : 'Вимкнено'}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-zinc-400">Тип: {qr.targetType}</p>
                <p className="text-sm break-all text-zinc-300 mt-1">{qr.targetValue}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{qr.scanCount} сканувань</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => copyLink(qr.slug)}
                    className="p-2 hover:bg-zinc-800 rounded-xl transition"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toggleQR(qr._id, qr.isActive)}
                    className="p-2 hover:bg-zinc-800 rounded-xl transition"
                  >
                    {qr.isActive ? <Trash2 className="w-5 h-5 text-red-400" /> : '🔄'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}