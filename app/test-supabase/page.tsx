"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState("Testando...");
  const [envVars, setEnvVars] = useState({
    url: "",
    key: "",
  });

  useEffect(() => {
    // Verificar variáveis de ambiente
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "NÃO ENCONTRADA",
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "ENCONTRADA"
        : "NÃO ENCONTRADA",
    });

    // Testar conexão com Supabase
    const testConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setConnectionStatus(`Erro: ${error.message}`);
        } else {
          setConnectionStatus("Conexão OK - Supabase funcionando");
        }
      } catch (err) {
        setConnectionStatus(`Erro de conexão: ${err}`);
      }
    };

    testConnection();
  }, []);

  const testLogin = async () => {
    const email = prompt("Digite seu email:");
    const password = prompt("Digite sua senha:");

    if (!email || !password) {
      alert("Email e senha são obrigatórios!");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Erro no login: ${error.message}`);
      } else {
        alert("Login bem-sucedido!");
      }
    } catch (err) {
      alert(`Erro: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Teste de Conexão Supabase</h1>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold">Variáveis de Ambiente:</h3>
              <p>URL: {envVars.url}</p>
              <p>Chave: {envVars.key}</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold">Status da Conexão:</h3>
              <p>{connectionStatus}</p>
            </div>

            <div className="pt-4">
              <button
                onClick={testLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Testar Login (Digite suas credenciais)
              </button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Instruções:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Verifique se as variáveis de ambiente estão carregadas</li>
                <li>Verifique se a conexão com Supabase está OK</li>
                <li>
                  Use suas credenciais reais: leandroandreengelmann@gmail.com
                </li>
                <li>Teste o login clicando no botão acima</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
