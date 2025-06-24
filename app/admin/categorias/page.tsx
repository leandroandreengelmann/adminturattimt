"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  status: "ativa" | "inativa";
  ordem: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<
    "todas" | "ativa" | "inativa"
  >("todas");
  const [busca, setBusca] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("ordem", { ascending: true });

      if (error) throw error;
      setCategorias(data || []);

      if (data && data.length > 0) {
        showSuccess(
          "Categorias Carregadas",
          `${data.length} categoria(s) encontrada(s) no sistema.`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar as categorias. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    // Aviso antes da confirmação
    showWarning(
      "Confirmação Necessária",
      `Você está prestes a excluir a categoria "${nome}". Esta ação não pode ser desfeita.`
    );

    // Aguarda um pouco para o usuário ver o aviso
    setTimeout(() => {
      if (
        !confirm(
          `Tem certeza que deseja excluir a categoria "${nome}"?\n\nEsta ação não pode ser desfeita e pode afetar subcategorias relacionadas.`
        )
      ) {
        showInfo("Operação Cancelada", "A categoria não foi excluída.");
        return;
      }

      performDelete(id, nome);
    }, 1000);
  };

  const performDelete = async (id: string, nome: string) => {
    try {
      setDeletingId(id);

      // Verificar se há subcategorias relacionadas
      const { data: subcategorias, error: subcategoriasError } = await supabase
        .from("subcategorias")
        .select("id, nome")
        .eq("categoria_id", id);

      if (subcategoriasError) throw subcategoriasError;

      if (subcategorias && subcategorias.length > 0) {
        showError(
          "Exclusão Bloqueada",
          `A categoria "${nome}" possui ${subcategorias.length} subcategoria(s) vinculada(s). Remova as subcategorias primeiro.`
        );
        setDeletingId(null);
        return;
      }

      const { error } = await supabase.from("categorias").delete().eq("id", id);

      if (error) throw error;

      setCategorias(categorias.filter((cat) => cat.id !== id));
      showSuccess(
        "Categoria Excluída",
        `A categoria "${nome}" foi excluída com sucesso do sistema.`
      );
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      showError(
        "Erro na Exclusão",
        `Ocorreu um erro ao tentar excluir a categoria "${nome}". Tente novamente.`
      );
    } finally {
      setDeletingId(null);
    }
  };

  const categoriasFiltradas = categorias.filter((categoria) => {
    const matchStatus =
      filtroStatus === "todas" || categoria.status === filtroStatus;
    const matchBusca =
      categoria.nome.toLowerCase().includes(busca.toLowerCase()) ||
      categoria.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const estatisticas = {
    total: categorias.length,
    ativas: categorias.filter((c) => c.status === "ativa").length,
    inativas: categorias.filter((c) => c.status === "inativa").length,
  };

  // Efeito para notificar sobre filtros aplicados
  useEffect(() => {
    if (categorias.length > 0 && (busca || filtroStatus !== "todas")) {
      const totalFiltradas = categoriasFiltradas.length;
      if (totalFiltradas === 0) {
        showWarning(
          "Nenhum Resultado",
          "Nenhuma categoria encontrada com os filtros aplicados."
        );
      } else {
        showInfo(
          "Filtros Aplicados",
          `${totalFiltradas} categoria(s) encontrada(s) com os filtros atuais.`
        );
      }
    }
  }, [busca, filtroStatus, categoriasFiltradas.length, categorias.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-base">
            Carregando categorias...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
            <p className="text-gray-600 text-lg">
              Gerencie as categorias do sistema
            </p>
          </div>
          <Link
            href="/admin/categorias/nova"
            className="inline-flex items-center px-4 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() =>
              showInfo(
                "Nova Categoria",
                "Redirecionando para o formulário de criação..."
              )
            }
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Categoria
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {estatisticas.total}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Total</p>
                <p className="text-sm text-gray-500">Todas as categorias</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-green-600">
                  {estatisticas.ativas}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Ativas</p>
                <p className="text-sm text-gray-500">Categorias visíveis</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-gray-600">
                  {estatisticas.inativas}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-600">Inativas</p>
                <p className="text-sm text-gray-500">Categorias ocultas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="lg:w-64">
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filtroStatus}
                  onChange={(e) =>
                    setFiltroStatus(
                      e.target.value as "todas" | "ativa" | "inativa"
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none"
                >
                  <option value="todas">Todas as categorias</option>
                  <option value="ativa">Apenas ativas</option>
                  <option value="inativa">Apenas inativas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados da busca */}
          {busca && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-base text-gray-600">
                Encontradas <strong>{categoriasFiltradas.length}</strong>{" "}
                categoria(s) para &ldquo;{busca}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                    Ordem
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                    Data
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoriasFiltradas.map((categoria) => (
                  <tr key={categoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {categoria.nome}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-base text-gray-600 max-w-xs truncate">
                        {categoria.descricao}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 bg-gray-100 text-gray-800 text-base font-medium rounded-full">
                        {categoria.ordem}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          categoria.status === "ativa"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {categoria.status === "ativa" ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-base text-gray-600">
                        {new Date(categoria.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/categorias/${categoria.id}/editar`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar categoria"
                          onClick={() =>
                            showInfo(
                              "Editar Categoria",
                              `Abrindo formulário de edição para "${categoria.nome}"`
                            )
                          }
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(categoria.id, categoria.nome)
                          }
                          disabled={deletingId === categoria.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir categoria"
                        >
                          {deletingId === categoria.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categoriasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-base text-gray-500">
                  {busca || filtroStatus !== "todas"
                    ? "Nenhuma categoria encontrada com os filtros aplicados."
                    : "Nenhuma categoria cadastrada."}
                </p>
                {!busca && filtroStatus === "todas" && (
                  <Link
                    href="/admin/categorias/nova"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() =>
                      showInfo(
                        "Primeira Categoria",
                        "Vamos criar sua primeira categoria!"
                      )
                    }
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Criar primeira categoria
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
