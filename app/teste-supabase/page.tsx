"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Produto = { id: number; nome: string; preco: number; status: string };

export default function TesteSupabasePage() {
  const [usuarios, setUsuarios] = useState<{ id: string; email?: string }[]>(
    []
  );
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erros, setErros] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testar = async () => {
    setLoading(true);
    setErros("");
    setUsuarios([]);
    setProdutos([]);
    let errosTemp = "";

    // Buscar usuários
    try {
      const { data: users, error: errorUsers } =
        await supabase.auth.admin.listUsers();
      if (errorUsers) {
        errosTemp += `Erro ao buscar usuários: ${errorUsers.message}\n`;
      } else {
        setUsuarios(users?.users || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        errosTemp += `Erro inesperado usuários: ${err.message}\n`;
      } else {
        errosTemp += `Erro inesperado usuários: ${String(err)}\n`;
      }
    }

    // Buscar produtos
    try {
      const { data: produtosData, error: errorProdutos } = await supabase
        .from("produtos")
        .select("id, nome, preco, status")
        .limit(5);
      if (errorProdutos) {
        errosTemp += `Erro ao buscar produtos: ${errorProdutos.message}\n`;
      } else {
        setProdutos(produtosData || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        errosTemp += `Erro inesperado produtos: ${err.message}\n`;
      } else {
        errosTemp += `Erro inesperado produtos: ${String(err)}\n`;
      }
    }

    setErros(errosTemp);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          Teste Supabase: Usuários e Produtos
        </h1>
        <button
          onClick={testar}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Testando..." : "Testar conexão e queries"}
        </button>

        {erros && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 whitespace-pre-wrap">
            <strong>Erros:</strong>\n{erros}
          </div>
        )}

        <div className="mb-4">
          <h2 className="font-semibold">Usuários:</h2>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
            {usuarios.length
              ? JSON.stringify(usuarios, null, 2)
              : "Nenhum usuário encontrado."}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold">Produtos:</h2>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
            {produtos.length
              ? JSON.stringify(produtos, null, 2)
              : "Nenhum produto encontrado."}
          </pre>
        </div>
      </div>
    </div>
  );
}
