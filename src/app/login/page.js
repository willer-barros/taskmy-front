"use client";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e293b]">
      <div className="w-full max-w-sm bg-[#2c3e5a] shadow-xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/favi.svg" // usa a sua logo da pasta /public
            alt="TaskMy Logo"
            width={100

            }
            height={60}
          />
        </div>

        {/* Formulário */}
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Login"
            className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-1">
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <a
              href="#"
              className="text-sm text-blue-500 hover:underline self-end"
            >
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Entrar
          </button>

          <button
            type="button"
            className="w-full border border-blue-600 text-blue-600 font-medium py-2 rounded-xl hover:bg-blue-50 transition"
          >
            Cadastre-se
          </button>
        </form>
      </div>
    </div>
  );
}
