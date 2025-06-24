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

interface Banner {
  id: number;
  titulo: string;
  descricao: string;
  imagem_url: string;
  ativo: boolean;
  ordem: number;
  link_destino: string;
  created_at: string;
  updated_at: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    carregarBanners();
  }, []);

  const carregarBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarStatus = async (id: number, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ ativo: novoStatus })
        .eq("id", id);

      if (error) throw error;

      setBanners(
        banners.map((banner) =>
          banner.id === id ? { ...banner, ativo: novoStatus } : banner
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const excluirBanner = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;

      setBanners(banners.filter((banner) => banner.id !== id));
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
    }
  };

  const bannersFiltrados = banners.filter((banner) => {
    const matchBusca =
      banner.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      banner.descricao?.toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && banner.ativo) ||
      (filtroStatus === "inativo" && !banner.ativo);

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
            <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
            <p className="text-lg text-gray-600 mt-1">
              Gerencie os banners do site ({banners.length}{" "}
              {banners.length === 1 ? "banner" : "banners"})
            </p>
          </div>
          <Link
            href="/admin/banners/novo"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Novo Banner
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
                placeholder="Digite o título ou descrição..."
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

        {/* Lista de Banners */}
        {bannersFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg">
              {busca || filtroStatus !== "todos"
                ? "Nenhum banner encontrado com os filtros aplicados."
                : "Nenhum banner cadastrado."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bannersFiltrados.map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Imagem */}
                  <div className="lg:w-80 h-48 lg:h-auto bg-gray-100 flex-shrink-0">
                    <img
                      src={banner.imagem_url}
                      alt={banner.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {banner.titulo}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              banner.ativo
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {banner.ativo ? "Ativo" : "Inativo"}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Ordem: {banner.ordem}
                          </span>
                        </div>

                        {banner.descricao && (
                          <p className="text-base text-gray-600 mb-3">
                            {banner.descricao}
                          </p>
                        )}

                        {banner.link_destino && (
                          <p className="text-sm text-blue-600 mb-3">
                            <strong>Link:</strong> {banner.link_destino}
                          </p>
                        )}

                        <div className="text-sm text-gray-500">
                          <span>
                            Criado em:{" "}
                            {new Date(banner.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </span>
                          {banner.updated_at !== banner.created_at && (
                            <span className="ml-4">
                              Atualizado em:{" "}
                              {new Date(banner.updated_at).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() =>
                            alternarStatus(banner.id, !banner.ativo)
                          }
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            banner.ativo
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={banner.ativo ? "Desativar" : "Ativar"}
                        >
                          {banner.ativo ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>

                        <Link
                          href={`/admin/banners/${banner.id}/editar`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>

                        <button
                          onClick={() => excluirBanner(banner.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Excluir"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
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
