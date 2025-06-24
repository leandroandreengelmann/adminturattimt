"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import {
  ArrowLeftIcon,
  TrashIcon,
  InformationCircleIcon,
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

export default function EditarConfiguracaoPage() {
  const router = useRouter();
  const params = useParams();
  const configuracaoId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null);

  // Estados do formulário
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [categoria, setCategoria] = useState("geral");
  const [ativo, setAtivo] = useState(true);
  const [ordem, setOrdem] = useState("0");

  // Estados de validação
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  const { ToastComponent, showSuccess, showError, showInfo, showWarning } =
    useToast();

  useEffect(() => {
    fetchConfiguracao();
  }, [configuracaoId]);

  useEffect(() => {
    if (configuracao) {
      verificarAlteracoes();
    }
  }, [titulo, texto, descricao, tipo, categoria, ativo, ordem, configuracao]);

  const fetchConfiguracao = async () => {
    try {
      setLoadingInitial(true);

      // Validar se o ID é um número válido
      if (!configuracaoId || isNaN(Number(configuracaoId))) {
        throw new Error("ID da configuração inválido");
      }

      showInfo("Carregando", "Buscando informações da configuração...");

      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("id", parseInt(configuracaoId))
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Configuração não encontrada");
        }
        throw error;
      }

      setConfiguracao(data);

      // Preencher formulário
      setTitulo(data.titulo);
      setTexto(data.texto || "");
      setDescricao(data.descricao || "");
      setTipo(data.tipo);
      setCategoria(data.categoria);
      setAtivo(data.ativo);
      setOrdem(data.ordem.toString());

      showSuccess("Configuração Carregada", `Editando "${data.titulo}".`);
    } catch (error) {
      console.error("Erro ao buscar configuração:", error);
      showError(
        "Erro ao Carregar",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a configuração."
      );
      setTimeout(() => router.push("/admin/configuracoes"), 2000);
    } finally {
      setLoadingInitial(false);
    }
  };

  const verificarAlteracoes = () => {
    if (!configuracao) return;

    const houveMudanca =
      titulo !== configuracao.titulo ||
      texto !== (configuracao.texto || "") ||
      descricao !== (configuracao.descricao || "") ||
      tipo !== configuracao.tipo ||
      categoria !== configuracao.categoria ||
      ativo !== configuracao.ativo ||
      parseInt(ordem) !== configuracao.ordem;

    setTemAlteracoes(houveMudanca);
  };

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    // Título é obrigatório
    if (!titulo.trim()) {
      novosErros.titulo = "Título é obrigatório";
    }

    // Pelo menos texto ou descrição deve estar preenchido
    if (!texto.trim() && !descricao.trim()) {
      novosErros.conteudo = "Preencha pelo menos o campo Texto ou Descrição";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      showError(
        "Formulário Inválido",
        "Corrija os erros indicados antes de continuar."
      );
      return;
    }

    if (!temAlteracoes) {
      showWarning("Sem Alterações", "Não há alterações para salvar.");
      return;
    }

    setLoading(true);

    try {
      showInfo("Atualizando", "Salvando alterações da configuração...");

      const configuracaoData = {
        titulo: titulo.trim(),
        texto: texto.trim() || null,
        descricao: descricao.trim() || null,
        tipo,
        categoria,
        ativo,
        ordem: parseInt(ordem) || 0,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("configuracoes")
        .update(configuracaoData)
        .eq("id", parseInt(configuracaoId));

      if (error) throw error;

      showSuccess(
        "Configuração Atualizada",
        `"${titulo}" foi atualizada com sucesso! Redirecionando...`
      );

      setTimeout(() => {
        router.push("/admin/configuracoes");
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
      showError(
        "Erro ao Atualizar",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a configuração."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!configuracao) return;

    if (
      !confirm(
        `Tem certeza que deseja EXCLUIR a configuração "${configuracao.titulo}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      showInfo("Excluindo", `Removendo "${configuracao.titulo}" do sistema...`);

      const { error } = await supabase
        .from("configuracoes")
        .delete()
        .eq("id", parseInt(configuracaoId));

      if (error) throw error;

      showSuccess(
        "Configuração Excluída",
        `"${configuracao.titulo}" foi removida com sucesso.`
      );

      setTimeout(() => {
        router.push("/admin/configuracoes");
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir configuração:", error);
      showError(
        "Erro na Exclusão",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a configuração."
      );
    }
  };

  const handleCancel = () => {
    if (temAlteracoes) {
      if (
        confirm(
          "Você tem alterações não salvas. Tem certeza que deseja cancelar?"
        )
      ) {
        router.push("/admin/configuracoes");
      }
    } else {
      router.push("/admin/configuracoes");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (loadingInitial) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">
              Carregando configuração...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!configuracao) {
    return (
      <>
        {ToastComponent}
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Configuração não encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              A configuração solicitada não existe ou foi removida.
            </p>
            <Link
              href="/admin/configuracoes"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white text-lg font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Voltar para Configurações
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Configuração
            </h1>
            <p className="text-gray-600 text-lg">
              Atualize as informações da configuração
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir configuração"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Excluir
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>

        {/* Informações da Configuração */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informações da Configuração
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-base">
            <div>
              <dt className="font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-gray-900">#{configuracao.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Identificador</dt>
              <dd className="mt-1 text-gray-900">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {configuracao.identificador}
                </code>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Criado em</dt>
              <dd className="mt-1 text-gray-900">
                {formatDate(configuracao.created_at)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Última atualização</dt>
              <dd className="mt-1 text-gray-900">
                {formatDate(configuracao.updated_at)}
              </dd>
            </div>
          </div>
          {temAlteracoes && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-base text-amber-800">
                ⚠️ Você tem alterações não salvas neste formulário.
              </p>
            </div>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Título da Configuração *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className={`w-full py-3 px-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    erros.titulo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Texto de Boas-vindas"
                />
                {erros.titulo && (
                  <p className="mt-1 text-sm text-red-600">{erros.titulo}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="texto">Texto</option>
                  <option value="descricao">Descrição</option>
                  <option value="html">HTML</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="geral">Geral</option>
                  <option value="homepage">Homepage</option>
                  <option value="produtos">Produtos</option>
                  <option value="contato">Contato</option>
                  <option value="sobre">Sobre</option>
                  <option value="servicos">Serviços</option>
                  <option value="footer">Rodapé</option>
                  <option value="header">Cabeçalho</option>
                </select>
              </div>

              {/* Ordem */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  min="0"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="ativo"
                    className="ml-2 text-base text-gray-700"
                  >
                    Configuração ativa
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Conteúdo
            </h2>
            <div className="space-y-6">
              {/* Texto */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Texto
                </label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o texto que será exibido..."
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a descrição detalhada..."
                />
              </div>

              {erros.conteudo && (
                <p className="text-sm text-red-600">{erros.conteudo}</p>
              )}
            </div>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-base font-medium text-blue-800">
                  Como usar no Frontend
                </h3>
                <div className="mt-2 text-base text-blue-700">
                  <p className="mb-2">
                    Para buscar esta configuração na API, use:
                  </p>
                  <code className="block bg-blue-100 p-2 rounded text-sm">
                    GET /api/configuracoes?id={configuracao.identificador}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || !temAlteracoes}
              className="flex-1 bg-blue-600 text-white text-lg font-medium py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white text-lg font-medium py-3 px-6 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
