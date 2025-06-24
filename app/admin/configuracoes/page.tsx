"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface Configuracao {
  id: number;
  identificador: string;
  titulo: string;
  texto?: string;
  descricao?: string;
  tipo: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const { ToastComponent, showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      showInfo("Carregando", "Buscando configurações do sistema...");

      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .order("categoria", { ascending: true })
        .order("ordem", { ascending: true });

      if (error) throw error;

      setConfiguracoes(data || []);
      showSuccess(
        "Configurações Carregadas",
        `${data?.length || 0} configurações encontradas.`
      );
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar as configurações."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (configuracao: Configuracao) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a configuração "${configuracao.titulo}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      showInfo(
        "Excluindo Configuração",
        `Removendo "${configuracao.titulo}" do sistema...`
      );

      const { error } = await supabase
        .from("configuracoes")
        .delete()
        .eq("id", configuracao.id);

      if (error) throw error;

      showSuccess(
        "Configuração Excluída",
        `"${configuracao.titulo}" foi removida com sucesso.`
      );

      fetchConfiguracoes();
    } catch (error) {
      console.error("Erro ao excluir configuração:", error);
      showError(
        "Erro na Exclusão",
        `Não foi possível excluir "${configuracao.titulo}". Tente novamente.`
      );
    }
  };

  const toggleStatus = async (configuracao: Configuracao) => {
    try {
      const novoStatus = !configuracao.ativo;
      showInfo(
        novoStatus ? "Ativando" : "Desativando",
        `${novoStatus ? "Ativando" : "Desativando"} "${configuracao.titulo}"...`
      );

      const { error } = await supabase
        .from("configuracoes")
        .update({
          ativo: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", configuracao.id);

      if (error) throw error;

      showSuccess(
        "Status Atualizado",
        `"${configuracao.titulo}" foi ${
          novoStatus ? "ativada" : "desativada"
        } com sucesso.`
      );

      fetchConfiguracoes();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showError(
        "Erro no Status",
        `Não foi possível alterar o status de "${configuracao.titulo}".`
      );
    }
  };

  const configuracoesFiltradas = configuracoes.filter((config) => {
    const matchBusca =
      config.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      config.identificador.toLowerCase().includes(busca.toLowerCase()) ||
      config.categoria.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = !filtroTipo || config.tipo === filtroTipo;
    const matchCategoria =
      !filtroCategoria || config.categoria === filtroCategoria;
    const matchStatus =
      !filtroStatus ||
      (filtroStatus === "ativo" && config.ativo) ||
      (filtroStatus === "inativo" && !config.ativo);

    return matchBusca && matchTipo && matchCategoria && matchStatus;
  });

  // Calcular estatísticas
  const estatisticas = {
    total: configuracoes.length,
    ativas: configuracoes.filter((c) => c.ativo).length,
    inativas: configuracoes.filter((c) => !c.ativo).length,
  };

  // Obter listas únicas para filtros
  const tipos = [...new Set(configuracoes.map((c) => c.tipo))];
  const categorias = [...new Set(configuracoes.map((c) => c.categoria))];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "texto":
        return DocumentTextIcon;
      case "descricao":
        return ChatBubbleLeftEllipsisIcon;
      default:
        return CogIcon;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "texto":
        return "Texto";
      case "descricao":
        return "Descrição";
      default:
        return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  if (loading) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">
              Carregando configurações...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 text-lg">
              Gerencie textos e componentes do sistema
            </p>
          </div>
          <Link
            href="/admin/configuracoes/nova"
            className="inline-flex items-center px-4 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() =>
              showInfo(
                "Nova Configuração",
                "Redirecionando para o formulário de criação..."
              )
            }
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Configuração
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
                <p className="text-sm text-gray-500">Todas as configurações</p>
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
                <p className="text-sm text-gray-500">Configurações visíveis</p>
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
                <p className="text-sm text-gray-500">Configurações ocultas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome, ID ou categoria..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os tipos</option>
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {getTipoLabel(tipo)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Configurações ({configuracoesFiltradas.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Configuração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configuracoesFiltradas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <CogIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-xl font-medium text-gray-900 mb-2">
                        Nenhuma configuração encontrada
                      </p>
                      <p className="text-base text-gray-500 mb-6">
                        {busca || filtroTipo || filtroCategoria || filtroStatus
                          ? "Tente ajustar os filtros ou criar uma nova configuração."
                          : "Comece criando sua primeira configuração."}
                      </p>
                      <Link
                        href="/admin/configuracoes/nova"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nova Configuração
                      </Link>
                    </td>
                  </tr>
                ) : (
                  configuracoesFiltradas.map((config) => {
                    const TipoIcon = getTipoIcon(config.tipo);
                    return (
                      <tr key={config.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center">
                              <TipoIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <p className="text-base font-medium text-gray-900">
                                  {config.titulo}
                                </p>
                                {config.texto && (
                                  <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {config.texto.length > 50
                                      ? `${config.texto.substring(0, 50)}...`
                                      : config.texto}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {config.identificador}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTipoLabel(config.tipo)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 capitalize">
                            {config.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleStatus(config)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              config.ativo
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {config.ativo ? (
                              <EyeIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <EyeSlashIcon className="h-4 w-4 mr-1" />
                            )}
                            {config.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Link
                              href={`/admin/configuracoes/${config.id}/editar`}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar configuração"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(config)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir configuração"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Link para nova configuração se não houver configurações */}
        {configuracoes.length === 0 && (
          <div className="text-center py-12">
            <CogIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhuma configuração cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira configuração do sistema.
            </p>
            <Link
              href="/admin/configuracoes/nova"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Criar Primeira Configuração
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
