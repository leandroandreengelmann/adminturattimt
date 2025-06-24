import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo Turatti */}
          <div className="mx-auto mb-8">
            <img
              src="https://klcyhngujfsseryvnqvk.supabase.co/storage/v1/object/public/images/logos/logo-1749659822147.png"
              alt="Logo Turatti"
              className="h-32 w-auto mx-auto"
            />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Bem-vindo ao
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {" "}
              Sistema
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plataforma moderna e segura para gerenciamento administrativo.
            Acesse o painel de controle para começar.
          </p>

          {/* CTA Button */}
          <div className="mb-16 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Acessar Painel Administrativo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
