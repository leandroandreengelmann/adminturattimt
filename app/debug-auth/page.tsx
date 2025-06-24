"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function DebugAuthPage() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult("Testando conexão...\n");

    try {
      // Criar cliente diretamente na página
      const supabase = createClient(
        "https://klcyhngujfsseryvnqvk.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3lobmd1amZzc2VyeXZucXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTgzMjksImV4cCI6MjA2NTE3NDMyOX0.IiIIBJCrzyhfYvL_Uc2hkMD3HUjbejiRW7Og4M25_h8"
      );

      setResult((prev) => prev + "✅ Cliente criado\n");

      // Testar sessão
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        setResult(
          (prev) => prev + `❌ Erro na sessão: ${sessionError.message}\n`
        );
      } else {
        setResult(
          (prev) =>
            prev +
            `✅ Sessão OK: ${sessionData.session ? "Logado" : "Não logado"}\n`
        );
      }

      // Testar uma query simples
      const { data: tableData, error: tableError } = await supabase
        .from("categorias")
        .select("count")
        .limit(1);

      if (tableError) {
        setResult((prev) => prev + `❌ Erro na query: ${tableError.message}\n`);
      } else {
        setResult(
          (prev) => prev + `✅ Query OK: ${JSON.stringify(tableData)}\n`
        );
      }
    } catch (err) {
      setResult((prev) => prev + `❌ Erro geral: ${err}\n`);
    }

    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResult("Testando login...\n");

    try {
      const supabase = createClient(
        "https://klcyhngujfsseryvnqvk.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsY3lobmd1amZzc2VyeXZucXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTgzMjksImV4cCI6MjA2NTE3NDMyOX0.IiIIBJCrzyhfYvL_Uc2hkMD3HUjbejiRW7Og4M25_h8"
      );

      const email = prompt("Digite seu email:");
      const password = prompt("Digite sua senha:");

      if (!email || !password) {
        setResult((prev) => prev + "❌ Email e senha são obrigatórios\n");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setResult((prev) => prev + `❌ Erro no login: ${error.message}\n`);
        setResult((prev) => prev + `Código do erro: ${error.status}\n`);
        setResult(
          (prev) => prev + `Detalhes: ${JSON.stringify(error, null, 2)}\n`
        );
      } else {
        setResult((prev) => prev + `✅ Login bem-sucedido!\n`);
        setResult((prev) => prev + `Usuário: ${data.user?.email}\n`);
        setResult((prev) => prev + `ID: ${data.user?.id}\n`);
      }
    } catch (err) {
      setResult((prev) => prev + `❌ Erro inesperado: ${err}\n`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Testes</h2>
            <div className="space-y-4">
              <button
                onClick={testConnection}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Testando..." : "Testar Conexão"}
              </button>

              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Testando..." : "Testar Login"}
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

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold text-yellow-800">Informações:</h3>
          <ul className="text-yellow-700 text-sm mt-2 space-y-1">
            <li>• URL: https://klcyhngujfsseryvnqvk.supabase.co</li>
            <li>• Chave anônima: Configurada</li>
            <li>• Email de teste: leandroandreengelmann@gmail.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
