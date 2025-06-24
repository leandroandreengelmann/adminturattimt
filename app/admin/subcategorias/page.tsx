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
}

interface Subcategoria {
  id: string;
  nome: string;
  descricao: string;
  categoria_id: string;
  ordem: number;
  status: "ativa" | "inativa";
  created_at: string;
  updated_at: string;
  categorias?: {
    nome: string;
  } | null;
}

export default function SubcategoriasPage() {
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<
    "todas" | "ativa" | "inativa"
  >("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias")
        .select("id, nome")
        .order("ordem", { ascending: true });

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

      // Buscar subcategorias com categorias
      const { data: subcategoriasData, error: subcategoriasError } =
        await supabase
          .from("subcategorias")
          .select(
            `
          *,
          categoria:categorias(id, nome)
        `
          )
          .order("ordem", { ascending: true });

      if (subcategoriasError) throw subcategoriasError;
      setSubcategorias(subcategoriasData || []);

      if (subcategoriasData && subcategoriasData.length > 0) {
        showSuccess(
          "Subcategorias Carregadas",
          `${subcategoriasData.length} subcategoria(s) encontrada(s) no sistema.`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar as subcategorias. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    showWarning(
      "Confirmação Necessária",
      `Você está prestes a excluir a subcategoria "${nome}". Esta ação não pode ser desfeita.`
    );

    setTimeout(() => {
      if (
        !confirm(
          `Tem certeza que deseja excluir a subcategoria "${nome}"?\n\nEsta ação não pode ser desfeita.`
        )
      ) {
        showInfo("Operação Cancelada", "A subcategoria não foi excluída.");
        return;
      }

      performDelete(id, nome);
    }, 1000);
  };

  const performDelete = async (id: string, nome: string) => {
    try {
      setDeletingId(id);
      showInfo("Excluindo", `Removendo a subcategoria "${nome}" do sistema...`);

      const { error } = await supabase
        .from("subcategorias")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSubcategorias(subcategorias.filter((sub) => sub.id !== id));
      showSuccess(
        "Subcategoria Excluída",
        `A subcategoria "${nome}" foi excluída com sucesso do sistema.`
      );
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      showError(
        "Erro na Exclusão",
        `Ocorreu um erro ao tentar excluir a subcategoria "${nome}". Tente novamente.`
      );
    } finally {
      setDeletingId(null);
    }
  };

  const subcategoriasFiltradas = subcategorias.filter((subcategoria) => {
    const matchStatus =
      filtroStatus === "todas" || subcategoria.status === filtroStatus;
    const matchCategoria =
      filtroCategoria === "todas" ||
      subcategoria.categoria_id === filtroCategoria;
    const matchBusca =
      subcategoria.nome.toLowerCase().includes(busca.toLowerCase()) ||
      subcategoria.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (subcategoria.categorias?.nome || "")
        .toLowerCase()
        .includes(busca.toLowerCase());
    return matchStatus && matchCategoria && matchBusca;
  });

  const estatisticas = {
    total: subcategorias.length,
    ativas: subcategorias.filter((s) => s.status === "ativa").length,
    inativas: subcategorias.filter((s) => s.status === "inativa").length,
  };

  // Efeito para notificar sobre filtros aplicados
  useEffect(() => {
    if (
      subcategorias.length > 0 &&
      (busca || filtroStatus !== "todas" || filtroCategoria !== "todas")
    ) {
      const totalFiltradas = subcategoriasFiltradas.length;
      if (totalFiltradas === 0) {
        showWarning(
          "Nenhum Resultado",
          "Nenhuma subcategoria encontrada com os filtros aplicados."
        );
      } else {
        showInfo(
          "Filtros Aplicados",
          `${totalFiltradas} subcategoria(s) encontrada(s) com os filtros atuais.`
        );
      }
    }
  }, [
    busca,
    filtroStatus,
    filtroCategoria,
    subcategoriasFiltradas.length,
    subcategorias.length,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-base">
            Carregando subcategorias...
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
            <h1 className="text-3xl font-bold text-gray-900">Subcategorias</h1>
            <p className="text-gray-600 text-lg">
              Gerencie as subcategorias do sistema
            </p>
          </div>
          <Link
            href="/admin/subcategorias/nova"
            className="inline-flex items-center px-4 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() =>
              showInfo(
                "Nova Subcategoria",
                "Redirecionando para o formulário de criação..."
              )
            }
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Subcategoria
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
                <p className="text-sm text-gray-500">Todas as subcategorias</p>
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
                <p className="text-sm text-gray-500">Subcategorias visíveis</p>
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
                <p className="text-sm text-gray-500">Subcategorias ocultas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="lg:col-span-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, descrição ou categoria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            {/* Filtro de Categoria */}
            <div className="lg:col-span-1">
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base appearance-none"
                >
                  <option value="todas">Todas as categorias</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtro de Status */}
            <div className="lg:col-span-1">
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
                  <option value="todas">Todos os status</option>
                  <option value="ativa">Apenas ativas</option>
                  <option value="inativa">Apenas inativas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados da busca */}
          {(busca ||
            filtroStatus !== "todas" ||
            filtroCategoria !== "todas") && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-base text-gray-600">
                Encontradas <strong>{subcategoriasFiltradas.length}</strong>{" "}
                subcategoria(s)
                {busca && ` para "${busca}"`}
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
                    Categoria
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
                {subcategoriasFiltradas.map((subcategoria) => (
                  <tr key={subcategoria.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {subcategoria.nome}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                        {subcategoria.categorias?.nome ||
                          "Categoria não encontrada"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-base text-gray-600 max-w-xs truncate">
                        {subcategoria.descricao}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center h-8 w-8 bg-gray-100 text-gray-800 text-base font-medium rounded-full">
                        {subcategoria.ordem}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          subcategoria.status === "ativa"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {subcategoria.status === "ativa" ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-base text-gray-600">
                        {new Date(subcategoria.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/admin/subcategorias/${subcategoria.id}/editar`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar subcategoria"
                          onClick={() =>
                            showInfo(
                              "Editar Subcategoria",
                              `Abrindo formulário de edição para "${subcategoria.nome}"`
                            )
                          }
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(subcategoria.id, subcategoria.nome)
                          }
                          disabled={deletingId === subcategoria.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir subcategoria"
                        >
                          {deletingId === subcategoria.id ? (
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

            {subcategoriasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-base text-gray-500">
                  {busca ||
                  filtroStatus !== "todas" ||
                  filtroCategoria !== "todas"
                    ? "Nenhuma subcategoria encontrada com os filtros aplicados."
                    : "Nenhuma subcategoria cadastrada."}
                </p>
                {!busca &&
                  filtroStatus === "todas" &&
                  filtroCategoria === "todas" && (
                    <Link
                      href="/admin/subcategorias/nova"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() =>
                        showInfo(
                          "Primeira Subcategoria",
                          "Vamos criar sua primeira subcategoria!"
                        )
                      }
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Criar primeira subcategoria
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
