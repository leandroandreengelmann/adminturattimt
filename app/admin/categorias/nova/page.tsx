"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NovaCategoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    slug: "",
    status: "ativa" as "ativa" | "inativa",
    ordem: 1,
  });

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .replace(/[áàâãä]/g, "a")
      .replace(/[éèêë]/g, "e")
      .replace(/[íìîï]/g, "i")
      .replace(/[óòôõö]/g, "o")
      .replace(/[úùûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "nome"
          ? generateSlug(value)
          : name === "ordem"
          ? parseInt(value) || 1
          : value,
    }));

    // Feedback visual para campos importantes
    if (name === "nome" && value.trim().length >= 3) {
      showInfo("Nome Válido", "Nome da categoria está adequado.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações com notificações
    if (!formData.nome.trim()) {
      showError("Campo Obrigatório", "O nome da categoria é obrigatório.");
      setLoading(false);
      return;
    }

    if (formData.nome.trim().length < 3) {
      showWarning(
        "Nome Muito Curto",
        "O nome da categoria deve ter pelo menos 3 caracteres."
      );
      setLoading(false);
      return;
    }

    try {
      showInfo("Criando Categoria", "Salvando a nova categoria no sistema...");

      // Verificar se já existe uma categoria com o mesmo nome
      const { data: existingCategoria, error: checkError } = await supabase
        .from("categorias")
        .select("id, nome")
        .ilike("nome", formData.nome.trim())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingCategoria) {
        showError(
          "Nome Já Existe",
          `Já existe uma categoria com o nome "${formData.nome.trim()}". Escolha um nome diferente.`
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("categorias").insert([formData]);

      if (error) throw error;

      showSuccess(
        "Categoria Criada",
        `A categoria "${formData.nome}" foi criada com sucesso!`
      );

      // Aguarda um pouco para o usuário ver a notificação antes de redirecionar
      setTimeout(() => {
        router.push("/admin/categorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      showError(
        "Erro na Criação",
        "Ocorreu um erro ao criar a categoria. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.nome.trim() || formData.descricao.trim()) {
      showWarning(
        "Dados Não Salvos",
        "Você tem alterações não salvas. Tem certeza que deseja cancelar?"
      );

      setTimeout(() => {
        if (confirm("Você tem dados não salvos. Deseja realmente cancelar?")) {
          showInfo(
            "Operação Cancelada",
            "Retornando para a lista de categorias..."
          );
          setTimeout(() => router.push("/admin/categorias"), 1000);
        }
      }, 1000);
    } else {
      showInfo("Cancelando", "Retornando para a lista de categorias...");
      setTimeout(() => router.push("/admin/categorias"), 1000);
    }
  };

  return (
    <>
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Categoria</h1>
            <p className="text-gray-600 text-lg">
              Criar uma nova categoria para o sistema
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label
                htmlFor="nome"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Nome da Categoria *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Digite o nome da categoria"
              />
              <p className="mt-2 text-sm text-gray-500">
                Nome que será exibido para identificar a categoria
              </p>
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="url-amigavel"
              />
              <p className="mt-2 text-sm text-gray-500">
                URL amigável (gerada automaticamente a partir do nome)
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Descreva brevemente esta categoria"
              />
              <p className="mt-2 text-sm text-gray-500">
                Descrição opcional para detalhar o propósito da categoria
              </p>
            </div>

            {/* Grid para Ordem e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ordem */}
              <div>
                <label
                  htmlFor="ordem"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  id="ordem"
                  name="ordem"
                  value={formData.ordem}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Número que define a ordem de exibição (menor = primeiro)
                </p>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Status determina se a categoria estará visível no sistema
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !formData.nome.trim()}
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando...
                  </div>
                ) : (
                  "Criar Categoria"
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Dicas para criar categorias
          </h3>
          <ul className="space-y-2 text-blue-800 text-base">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Use nomes claros e descritivos para facilitar a identificação
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                A ordem de exibição determina como as categorias aparecem nas
                listagens
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Categorias inativas não ficam visíveis para usuários finais
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Você pode editar estas informações posteriormente se necessário
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
