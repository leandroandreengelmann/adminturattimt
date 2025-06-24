"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface RedeSocial {
  id: number;
  nome: string;
  link: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

// Mapeamento de ícones para exibição
const iconeMap: { [key: string]: string } = {
  instagram: "📷",
  facebook: "📘",
  twitter: "🐦",
  linkedin: "💼",
  youtube: "📺",
  tiktok: "🎵",
  whatsapp: "💬",
  telegram: "✈️",
  pinterest: "📌",
  snapchat: "👻",
  discord: "🎮",
  github: "💻",
};

export default function RedesSociaisPage() {
  const [redesSociais, setRedesSociais] = useState<RedeSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    carregarRedesSociais();
  }, []);

  const carregarRedesSociais = async () => {
    try {
      const { data, error } = await supabase
        .from("redes_sociais")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      setRedesSociais(data || []);
    } catch (error) {
      console.error("Erro ao carregar redes sociais:", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarStatus = async (id: number, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("redes_sociais")
        .update({ ativo: novoStatus })
        .eq("id", id);

      if (error) throw error;

      setRedesSociais(
        redesSociais.map((rede) =>
          rede.id === id ? { ...rede, ativo: novoStatus } : rede
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const excluirRedeSocial = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta rede social?")) return;

    try {
      const { error } = await supabase
        .from("redes_sociais")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRedesSociais(redesSociais.filter((rede) => rede.id !== id));
    } catch (error) {
      console.error("Erro ao excluir rede social:", error);
    }
  };

  const redesFiltradas = redesSociais.filter((rede) => {
    const matchBusca =
      rede.nome.toLowerCase().includes(busca.toLowerCase()) ||
      rede.link.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && rede.ativo) ||
      (filtroStatus === "inativo" && !rede.ativo);

    return matchBusca && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Redes Sociais</h1>
            <p className="text-lg text-gray-600 mt-1">
              Gerencie as redes sociais do site ({redesSociais.length}{" "}
              {redesSociais.length === 1 ? "rede" : "redes"})
            </p>
          </div>
          <Link
            href="/admin/redes-sociais/nova"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Nova Rede Social
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="busca"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Buscar
              </label>
              <input
                type="text"
                id="busca"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o nome ou link..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Redes Sociais */}
        {redesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg">
              {busca || filtroStatus !== "todos"
                ? "Nenhuma rede social encontrada com os filtros aplicados."
                : "Nenhuma rede social cadastrada."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redesFiltradas.map((rede) => (
              <div
                key={rede.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {iconeMap[rede.icone] || "🌐"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {rede.nome}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rede.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rede.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => alternarStatus(rede.id, !rede.ativo)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        rede.ativo
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={rede.ativo ? "Desativar" : "Ativar"}
                    >
                      {rede.ativo ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>

                    <Link
                      href={`/admin/redes-sociais/${rede.id}/editar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>

                    <button
                      onClick={() => excluirRedeSocial(rede.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Excluir"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Link:
                    </span>
                    <a
                      href={rede.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-700 break-all"
                    >
                      {rede.link}
                    </a>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ícone: {rede.icone}</span>
                    <span>Ordem: {rede.ordem}</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Criado em:{" "}
                    {new Date(rede.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
