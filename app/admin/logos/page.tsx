"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface Logo {
  id: string;
  nome: string;
  tipo: "branca" | "azul";
  posicao: "cabecalho" | "rodape";
  imagem_url: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function LogosPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPosicao, setFiltroPosicao] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    carregarLogos();
  }, []);

  const carregarLogos = async () => {
    try {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error("Erro ao carregar logos:", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarStatus = async (id: string, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("logos")
        .update({
          ativo: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setLogos(
        logos.map((logo) =>
          logo.id === id ? { ...logo, ativo: novoStatus } : logo
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const logosFiltrados = logos.filter((logo) => {
    const matchBusca = logo.nome.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === "todos" || logo.tipo === filtroTipo;

    const matchPosicao =
      filtroPosicao === "todos" || logo.posicao === filtroPosicao;

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && logo.ativo) ||
      (filtroStatus === "inativo" && !logo.ativo);

    return matchBusca && matchTipo && matchPosicao && matchStatus;
  });

  const getTipoEmoji = (tipo: string) => {
    switch (tipo) {
      case "branca":
        return "⚪";
      case "azul":
        return "🔵";
      default:
        return "🖼️";
    }
  };

  const getPosicaoEmoji = (posicao: string) => {
    switch (posicao) {
      case "cabecalho":
        return "⬆️";
      case "rodape":
        return "⬇️";
      default:
        return "📍";
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Logos</h1>
            <p className="text-lg text-gray-600 mt-1">
              Gerencie os logos do cabeçalho e rodapé ({logos.length}{" "}
              {logos.length === 1 ? "logo" : "logos"})
            </p>
          </div>
          <Link
            href="/admin/logos/novo"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Novo Logo
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                placeholder="Digite o nome do logo..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Tipo
              </label>
              <select
                id="tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os tipos</option>
                <option value="branca">⚪ Branca</option>
                <option value="azul">🔵 Azul</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="posicao"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Posição
              </label>
              <select
                id="posicao"
                value={filtroPosicao}
                onChange={(e) => setFiltroPosicao(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todas as posições</option>
                <option value="cabecalho">⬆️ Cabeçalho</option>
                <option value="rodape">⬇️ Rodapé</option>
              </select>
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

        {/* Estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {logos.length}
              </div>
              <div className="text-sm text-gray-500">Total de Logos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {logos.filter((l) => l.ativo).length}
              </div>
              <div className="text-sm text-gray-500">Ativos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {logos.filter((l) => l.tipo === "branca").length}
              </div>
              <div className="text-sm text-gray-500">⚪ Brancas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {logos.filter((l) => l.tipo === "azul").length}
              </div>
              <div className="text-sm text-gray-500">🔵 Azuis</div>
            </div>
          </div>
        </div>

        {/* Lista de Logos */}
        {logosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <PhotoIcon className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Nenhum logo encontrado
            </h3>
            <p className="mt-2 text-gray-500">
              {logos.length === 0
                ? "Comece criando seu primeiro logo."
                : "Tente ajustar os filtros para encontrar o que procura."}
            </p>
            {logos.length === 0 && (
              <Link
                href="/admin/logos/novo"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Primeiro Logo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logosFiltrados.map((logo) => (
              <div
                key={logo.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Preview da imagem */}
                <div className="relative h-32 bg-gray-100">
                  <Image
                    src={logo.imagem_url}
                    alt={logo.nome}
                    fill
                    className="object-contain p-2"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbyBuw6NvIGVuY29udHJhZG88L3RleHQ+Cjwvc3ZnPgo=";
                    }}
                  />
                </div>

                <div className="p-4">
                  {/* Nome e badges */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {logo.nome}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getTipoEmoji(logo.tipo)} {logo.tipo}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getPosicaoEmoji(logo.posicao)} {logo.posicao}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          logo.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {logo.ativo ? "✅ Ativo" : "❌ Inativo"}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/logos/${logo.id}/editar`}
                      className="flex-1"
                    >
                      <button className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <PencilIcon className="h-4 w-4 inline mr-1" />
                        Editar
                      </button>
                    </Link>
                    <button
                      onClick={() => alternarStatus(logo.id, !logo.ativo)}
                      className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        logo.ativo
                          ? "text-red-700 bg-red-100 hover:bg-red-200"
                          : "text-green-700 bg-green-100 hover:bg-green-200"
                      }`}
                    >
                      {logo.ativo ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => window.open(logo.imagem_url, "_blank")}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
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
