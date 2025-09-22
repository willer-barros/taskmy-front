export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e293b] text-center">
      <h1 className="text-5xl font-bold text-gray-40 mb-4">404</h1>
      <p className="text-lg text-gray-40 mb-6">
        Oops! A página que você procura não foi encontrada.
      </p>
      <a
        href="login/"
        className="px-6 py-3 bg-[#3a5786] text-white rounded-xl hover:bg-[#0a2755] transition"
      >
        Voltar para Home
      </a>
    </div>
  );
}
