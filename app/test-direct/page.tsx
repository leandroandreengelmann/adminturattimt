"use client";

import { useState } from "react";

export default function TestDirectPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testDirectAuth = async () => {
    setLoading(true);
    setResult("Testando autenticação direta...\n");

    try {
      const response = await fetch(
        "https://klcyhngujfsseryvnqvk.supabase.co/auth/v1/token?grant_type=password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3lobmd1amZzc2VyeXZucXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTgzMjksImV4cCI6MjA2NTE3NDMyOX0.IiIIBJCrzyhfYvL_Uc2hkMD3HUjbejiRW7Og4M25_h8",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3lobmd1amZzc2VyeXZucXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTgzMjksImV4cCI6MjA2NTE3NDMyOX0.IiIIBJCrzyhfYvL_Uc2hkMD3HUjbejiRW7Og4M25_h8",
          },
          body: JSON.stringify({
            email: "leandroandreengelmann@gmail.com",
            password: "123456",
          }),
        }
      );

      setResult((prev) => prev + `Status: ${response.status}\n`);

      const data = await response.text();
      setResult((prev) => prev + `Response: ${data}\n`);

      if (response.ok) {
        setResult((prev) => prev + "✅ Autenticação direta funcionou!\n");
      } else {
        setResult((prev) => prev + "❌ Erro na autenticação direta\n");
      }
    } catch (err) {
      setResult((prev) => prev + `❌ Erro: ${err}\n`);
    }

    setLoading(false);
  };

  const testSupabaseClient = async () => {
    setLoading(true);
    setResult("Testando com cliente Supabase...\n");

    try {
      // Importar dinamicamente para evitar problemas de SSR
      const { createClient } = await import("@supabase/supabase-js");

      const supabase = createClient(
        "https://klcyhngujfsseryvnqvk.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3lobmd1amZzc2VyeXZucXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTgzMjksImV4cCI6MjA2NTE3NDMyOX0.IiIIBJCrzyhfYvL_Uc2hkMD3HUjbejiRW7Og4M25_h8"
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "leandroandreengelmann@gmail.com",
        password: "123456",
      });

      if (error) {
        setResult((prev) => prev + `❌ Erro: ${error.message}\n`);
        setResult((prev) => prev + `Status: ${error.status}\n`);
        setResult(
          (prev) => prev + `Detalhes: ${JSON.stringify(error, null, 2)}\n`
        );
      } else {
        setResult((prev) => prev + `✅ Login bem-sucedido!\n`);
        setResult((prev) => prev + `Usuário: ${data.user?.email}\n`);
      }
    } catch (err) {
      setResult((prev) => prev + `❌ Erro: ${err}\n`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Teste Direto de Autenticação
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Testes</h2>
            <div className="space-y-4">
              <button
                onClick={testDirectAuth}
                disabled={loading}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Testando..." : "Teste Direto (Fetch)"}
              </button>

              <button
                onClick={testSupabaseClient}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Testando..." : "Teste Cliente Supabase"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {result || "Clique em um botão para testar..."}
            </pre>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-semibold text-blue-800">Informações de Teste:</h3>
          <ul className="text-blue-700 text-sm mt-2 space-y-1">
            <li>• Email: leandroandreengelmann@gmail.com</li>
            <li>• Senha: 123456 (resetada no banco)</li>
            <li>• URL: https://klcyhngujfsseryvnqvk.supabase.co</li>
            <li>• Chave anônima: Verificada</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
