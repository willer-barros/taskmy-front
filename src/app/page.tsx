'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    console.log('🔑 Token recuperado:', token); // DEBUG
    return token;
  }
  return null;
};

const getHeaders = () => {
  const token = getAuthToken();
  console.log('📤 Enviando headers com token:', token); // DEBUG
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Token ${token}` }),
  };
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/task');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1e293b] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  );
}