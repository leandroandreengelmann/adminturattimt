"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Categoria {
  id: string;
  nome: string;
}

export default function NovaSubcategoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria_id: "",
    ordem: 1,
    status: "ativa" as "ativa" | "inativa",
  });

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoadingPage(true);
      showInfo("Carregando", "Buscando categorias disponíveis...");

      const { data, error } = await supabase
        .from("categorias")
        .select("id, nome")
        .eq("status", "ativa")
        .order("nome");

      if (error) throw error;

      setCategorias(data || []);

      if (data && data.length > 0) {
        showSuccess(
          "Categorias Carregadas",
          `${data.length} categoria(s) ativa(s) disponível(eis) para seleção.`
        );
      } else {
        showWarning(
          "Nenhuma Categoria Ativa",
          "Não há categorias ativas disponíveis. Crie uma categoria primeiro."
        );
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar as categorias. Tente novamente."
      );
    } finally {
      setLoadingPage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações com notificações
    if (!formData.nome.trim()) {
      showError("Campo Obrigatório", "O nome da subcategoria é obrigatório.");
      setLoading(false);
      return;
    }

    if (formData.nome.trim().length < 3) {
      showWarning(
        "Nome Muito Curto",
        "O nome da subcategoria deve ter pelo menos 3 caracteres."
      );
      setLoading(false);
      return;
    }

    if (!formData.categoria_id) {
      showError(
        "Categoria Obrigatória",
        "Selecione uma categoria para a subcategoria."
      );
      setLoading(false);
      return;
    }

    try {
      showInfo(
        "Criando Subcategoria",
        "Salvando a nova subcategoria no sistema..."
      );

      // Verificar se já existe uma subcategoria com o mesmo nome na mesma categoria
      const { data: existingSubcategoria, error: checkError } = await supabase
        .from("subcategorias")
        .select("id, nome")
        .eq("categoria_id", formData.categoria_id)
        .ilike("nome", formData.nome.trim())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingSubcategoria) {
        const categoria = categorias.find(
          (c) => c.id === formData.categoria_id
        );
        showError(
          "Nome Já Existe",
          `Já existe uma subcategoria com o nome "${formData.nome.trim()}" na categoria "${
            categoria?.nome
          }". Escolha um nome diferente.`
        );
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("subcategorias").insert([
        {
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          categoria_id: formData.categoria_id,
          ordem: formData.ordem,
          status: formData.status,
        },
      ]);

      if (error) throw error;

      const categoria = categorias.find((c) => c.id === formData.categoria_id);
      showSuccess(
        "Subcategoria Criada",
        `A subcategoria "${formData.nome}" foi criada com sucesso na categoria "${categoria?.nome}"!`
      );

      // Aguarda um pouco para o usuário ver a notificação antes de redirecionar
      setTimeout(() => {
        router.push("/admin/subcategorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar subcategoria:", error);
      showError(
        "Erro na Criação",
        "Ocorreu um erro ao criar a subcategoria. Verifique os dados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ordem" ? parseInt(value) || 1 : value,
    }));

    // Feedback visual para campos importantes
    if (name === "nome" && value.trim().length >= 3) {
      showInfo("Nome Válido", "Nome da subcategoria está adequado.");
    }
    if (name === "categoria_id" && value) {
      const categoria = categorias.find((c) => c.id === value);
      showInfo(
        "Categoria Selecionada",
        `Categoria "${categoria?.nome}" selecionada.`
      );
    }
  };

  const handleCancel = () => {
    if (
      formData.nome.trim() ||
      formData.descricao.trim() ||
      formData.categoria_id
    ) {
      showWarning(
        "Dados Não Salvos",
        "Você tem alterações não salvas. Tem certeza que deseja cancelar?"
      );

      setTimeout(() => {
        if (confirm("Você tem dados não salvos. Deseja realmente cancelar?")) {
          showInfo(
            "Operação Cancelada",
            "Retornando para a lista de subcategorias..."
          );
          setTimeout(() => router.push("/admin/subcategorias"), 1000);
        }
      }, 1000);
    } else {
      showInfo("Cancelando", "Retornando para a lista de subcategorias...");
      setTimeout(() => router.push("/admin/subcategorias"), 1000);
    }
  };

  if (loadingPage) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">
              Carregando formulário...
            </p>
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
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nova Subcategoria
            </h1>
            <p className="text-gray-600 text-lg">
              Criar uma nova subcategoria para o sistema
            </p>
          </div>
        </div>

        {/* Aviso se não há categorias */}
        {categorias.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Nenhuma categoria ativa encontrada
                </h3>
                <p className="text-yellow-800 text-base mb-4">
                  Para criar uma subcategoria, é necessário ter pelo menos uma
                  categoria ativa no sistema.
                </p>
                <Link
                  href="/admin/categorias/nova"
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-base font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                  onClick={() =>
                    showInfo(
                      "Criando Categoria",
                      "Redirecionando para criar uma nova categoria..."
                    )
                  }
                >
                  Criar Categoria Primeiro
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {categorias.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Nome da Subcategoria *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Digite o nome da subcategoria"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Nome que será exibido para identificar a subcategoria
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label
                  htmlFor="categoria_id"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Categoria Principal *
                </label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  Categoria à qual esta subcategoria pertencerá
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
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Descreva brevemente esta subcategoria"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Descrição opcional para detalhar o propósito da subcategoria
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Status determina se a subcategoria estará visível no sistema
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    loading || !formData.nome.trim() || !formData.categoria_id
                  }
                  className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Criando...
                    </div>
                  ) : (
                    "Criar Subcategoria"
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
        )}

        {/* Dicas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Dicas para criar subcategorias
          </h3>
          <ul className="space-y-2 text-blue-800 text-base">
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Subcategorias devem pertencer a uma categoria ativa existente
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Use nomes específicos que complementem a categoria principal
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                A ordem define como as subcategorias aparecem dentro da
                categoria
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">•</span>
              <span>
                Subcategorias inativas não ficam visíveis para usuários finais
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
