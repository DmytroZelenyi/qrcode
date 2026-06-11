'use client';

import { useState } from 'react';
import axios from 'axios';
import { setToken } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    const res = await axios.post(`${API_URL}${url}`, body);
    
    setToken(res.data.token);         
    onSuccess(res.data.user);
    onClose();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Помилка');
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6">{isLogin ? 'Увійти' : 'Реєстрація'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input type="text" placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-800 rounded-2xl px-5 py-3" required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 rounded-2xl px-5 py-3" required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 rounded-2xl px-5 py-3" required />

          <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-semibold">
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        <p className="text-center mt-4 text-zinc-400">
          {isLogin ? "Немає акаунту?" : "Вже є акаунт?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white underline">Переключитись</button>
        </p>

        <button onClick={onClose} className="mt-6 text-zinc-400 w-full">Закрити</button>
        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
      </div>
    </div>
  );
}