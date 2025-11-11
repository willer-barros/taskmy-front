"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_API_URL = "http://192.168.0.107:8000/api"

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = `${AUTH_API_URL}/auth-token/`

    try{
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
      })

      const data = await res.json();
      console.log('✅ Token recebido:', data.token);

      if(!res.ok){
        throw new Error(data.detail || "Falha na autenticação")
      }

      if(isLoginView){
        localStorage.setItem('authToken', data.token);
        
        //mexido aqui
        const savedToken = localStorage.getItem('authToken');
        console.log('💾 Token salvo verificado:', savedToken);


        router.push('/task'); //talvez eu deva alterar o camino para o login
      } else{
        alert("Usuário registrado com sucesso! Por favor, faça o login")
        setIsLoginView(true)
      }
    } catch (err){
      setError(err.message);
      console.error('❌ Erro no login:', err);
    } finally{
      setLoading(false)
    }
  }

  const handleRegister = () => {
    window.location.href = '/register';
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e293b]">
      <div className="w-full max-w-sm bg-[#2c3e5a] shadow-xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/taskMy.ico"
            alt="TaskMy Logo"
            width={100}
            height={60}
          />
        </div>

        {/* Formulário */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <input
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <a
              href="recuperation/"
              className="text-sm text-white hover:underline self-end"
            >
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white font-medium py-2 rounded-xl hover:bg-green-700 transition"
          >
            {loading ? "Entrando...": 'Entrar'}
          </button>

          <button
            type="button"
            onClick={handleRegister}
            className="w-full border border-white text-white font-medium py-2 rounded-xl hover:bg-rose-400 transition"
          >
            Cadastre-se
          </button>
        </form>
      </div>
    </div>
  );
}
