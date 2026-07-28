'use client';

import { useState } from 'react';
import api from '../lib/axios';
import { setToken } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

// Signature motif: viewfinder corner marks that resolve into focus on hover.
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

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const res = await api.post(url, body);

      setToken(res.data.token);
      onSuccess(res.data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F2A4A]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#16324F] border border-[#2A4A68] rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-mono font-bold mb-6 text-[#ECE7DA]">{isLogin ? 'Sign in' : 'Create account'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0F2A4A] border border-[#2A4A68] rounded-lg px-5 py-3 text-[#ECE7DA] placeholder-[#9FB0C3] focus:outline-none focus:border-[#C4703F] transition-colors duration-300"
            required
          />

          <button
            type="submit"
            className="relative group w-full bg-[#C4703F] text-[#0F2A4A] py-3.5 rounded-lg font-semibold hover:bg-[#D6875A] transition-colors duration-300"
          >
            {isLogin ? 'Sign in' : 'Create account'}
            <CornerMarks color="#0F2A4A" />
          </button>
        </form>

        <p className="text-center mt-4 text-[#9FB0C3] text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#ECE7DA] underline underline-offset-2 hover:text-[#C4703F] transition-colors duration-300">
            Switch
          </button>
        </p>

        <button onClick={onClose} className="mt-6 text-[#9FB0C3] hover:text-[#ECE7DA] w-full text-sm transition-colors duration-300">
          Close
        </button>
        {error && <p className="text-[#A8453A] text-center mt-3 text-sm">{error}</p>}
      </div>
    </div>
  );
}