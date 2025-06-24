"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NovaConfiguracaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [identificador, setIdentificador] = useState("");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [categoria, setCategoria] = useState("geral");
  const [ativo, setAtivo] = useState(true);
  const [ordem, setOrdem] = useState("0");

  // Estados de validação
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const { ToastComponent, showSuccess, showError, showInfo } = useToast();

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    if (!identificador.trim()) {
      novosErros.identificador = "Identificador é obrigatório";
    }

    if (!titulo.trim()) {
      novosErros.titulo = "Título é obrigatório";
    }

    if (!texto.trim() && !descricao.trim()) {
      novosErros.conteudo = "Preencha pelo menos o campo Texto ou Descrição";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      showError("Formulário Inválido", "Corrija os erros indicados.");
      return;
    }

    setLoading(true);

    try {
      showInfo("Criando", "Salvando configuração...");

      const { error } = await supabase.from("configuracoes").insert([
        {
          identificador: identificador.toLowerCase(),
          titulo: titulo.trim(),
          texto: texto.trim() || null,
          descricao: descricao.trim() || null,
          tipo,
          categoria,
          ativo,
          ordem: parseInt(ordem) || 0,
        },
      ]);

      if (error) throw error;

      showSuccess("Sucesso", "Configuração criada! Redirecionando...");

      setTimeout(() => {
        router.push("/admin/configuracoes");
      }, 1500);
    } catch (error) {
      console.error("Erro:", error);
      showError("Erro", "Não foi possível criar a configuração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nova Configuração
            </h1>
            <p className="text-gray-600 text-lg">
              Crie uma nova configuração de texto ou descrição
            </p>
          </div>
          <Link
            href="/admin/configuracoes"
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </Link>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full py-3 px-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    erros.titulo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: Texto de Boas-vindas"
                />
                {erros.titulo && (
                  <p className="mt-1 text-sm text-red-600">{erros.titulo}</p>
                )}
              </div>

              {/* Identificador */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Identificador Único *
                </label>
                <input
                  type="text"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  className={`w-full py-3 px-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono ${
                    erros.identificador ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ex: texto_boas_vindas"
                />
                {erros.identificador && (
                  <p className="mt-1 text-sm text-red-600">
                    {erros.identificador}
                  </p>
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
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Ordem
                </label>
                <input
                  type="number"
                  min="0"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o texto..."
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
                  className="w-full py-3 px-4 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite a descrição..."
                />
              </div>

              {erros.conteudo && (
                <p className="text-sm text-red-600">{erros.conteudo}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 text-base text-gray-700">
                Configuração ativa
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white text-lg font-medium py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Criando..." : "Criar Configuração"}
            </button>
            <Link
              href="/admin/configuracoes"
              className="flex-1 bg-gray-600 text-white text-lg font-medium py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
