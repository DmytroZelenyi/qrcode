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
      alert('Failed to update status');
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${BACKEND_URL.replace(/\/$/, '')}/q/${slug}`);
    alert('Link copied!');
  };

  if (loading) return <p className="text-center py-10 text-[#9FB0C3]">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-mono font-semibold">My QR codes</h2>
        <p className="text-[#9FB0C3] text-sm">Manage your dynamic QR codes</p>
      </div>

      {qrs.length === 0 ? (
        <div className="text-center py-20 bg-[#16324F] border border-[#2A4A68] rounded-2xl">
          <QrCode className="w-14 h-14 mx-auto mb-4 text-[#2A4A68]" />
          <p className="text-lg">You don&apos;t have any QR codes yet</p>
          <p className="text-[#9FB0C3] mt-2 text-sm">Go to the designer or generator to create your first one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qrs.map(qr => (
            <div key={qr._id} className="relative group bg-[#16324F] border border-[#2A4A68] rounded-2xl p-6 hover:border-[#C4703F]/40 transition-colors duration-300">
              <CornerMarks />
              <div className="flex justify-between items-start">
                <div>
                  <code className="text-xl font-mono text-[#8FB89A]">{qr.slug}</code>
                  <p className="text-xs text-[#9FB0C3] mt-1">
                    {new Date(qr.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-mono ${qr.isActive ? 'bg-[#5C8A6A]/20 text-[#8FB89A]' : 'bg-[#A8453A]/20 text-[#C8756A]'}`}>
                  {qr.isActive ? 'Active' : 'Disabled'}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-[#9FB0C3]">Type: {qr.targetType}</p>
                <p className="text-sm break-all text-[#ECE7DA] mt-1">{qr.targetValue}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#9FB0C3]">
                  <Eye className="w-4 h-4" />
                  <span>{qr.scanCount} scans</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(qr.slug)}
                    className="p-2 hover:bg-[#0F2A4A] rounded-lg transition-colors duration-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleQR(qr._id, qr.isActive)}
                    className="p-2 hover:bg-[#0F2A4A] rounded-lg transition-colors duration-300"
                  >
                    {qr.isActive ? <Trash2 className="w-4 h-4 text-[#C8756A]" /> : '🔄'}
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