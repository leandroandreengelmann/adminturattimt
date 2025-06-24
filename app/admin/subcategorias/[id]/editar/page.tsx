"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

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

interface Categoria {
  id: string;
  nome: string;
}

export default function EditarSubcategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const subcategoriaId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [subcategoria, setSubcategoria] = useState<Subcategoria | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    categoria_id: "",
    ordem: 1,
    status: "ativa" as "ativa" | "inativa",
  });
  const [initialFormData, setInitialFormData] = useState({
    nome: "",
    descricao: "",
    categoria_id: "",
    ordem: 1,
    status: "ativa" as "ativa" | "inativa",
  });

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  useEffect(() => {
    if (subcategoriaId) {
      fetchData();
    }
  }, [subcategoriaId]);

  const fetchData = async () => {
    try {
      setLoadingPage(true);
      showInfo("Carregando", "Buscando dados da subcategoria...");

      // Buscar subcategoria e categorias em paralelo
      const [subcategoriaResponse, categoriasResponse] = await Promise.all([
        supabase
          .from("subcategorias")
          .select(
            `
            *,
            categorias (
              nome
            )
          `
          )
          .eq("id", subcategoriaId)
          .single(),
        supabase
          .from("categorias")
          .select("id, nome")
          .eq("status", "ativa")
          .order("nome"),
      ]);

      if (subcategoriaResponse.error) throw subcategoriaResponse.error;
      if (categoriasResponse.error) throw categoriasResponse.error;

      setSubcategoria(subcategoriaResponse.data);
      setCategorias(categoriasResponse.data || []);

      const formValues = {
        nome: subcategoriaResponse.data.nome,
        descricao: subcategoriaResponse.data.descricao || "",
        categoria_id: subcategoriaResponse.data.categoria_id,
        ordem: subcategoriaResponse.data.ordem || 1,
        status: subcategoriaResponse.data.status,
      };
      setFormData(formValues);
      setInitialFormData(formValues);

      showSuccess(
        "Subcategoria Carregada",
        `Dados da subcategoria "${subcategoriaResponse.data.nome}" carregados com sucesso.`
      );
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      showError(
        "Subcategoria Não Encontrada",
        "A subcategoria solicitada não foi encontrada no sistema."
      );
      setTimeout(() => router.push("/admin/subcategorias"), 2000);
    } finally {
      setLoadingPage(false);
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

    // Feedback para alterações importantes
    if (name === "nome" && value.trim() !== initialFormData.nome) {
      showInfo("Nome Alterado", "O nome da subcategoria foi modificado.");
    }
    if (name === "categoria_id" && value !== initialFormData.categoria_id) {
      const categoria = categorias.find((c) => c.id === value);
      showWarning(
        "Categoria Alterada",
        `Categoria alterada para "${categoria?.nome}".`
      );
    }
    if (name === "status" && value !== initialFormData.status) {
      showWarning("Status Alterado", `Status alterado para "${value}".`);
    }
  };

  const hasChanges = () => {
    return (
      formData.nome !== initialFormData.nome ||
      formData.descricao !== initialFormData.descricao ||
      formData.categoria_id !== initialFormData.categoria_id ||
      formData.ordem !== initialFormData.ordem ||
      formData.status !== initialFormData.status
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showError("Campo Obrigatório", "O nome da subcategoria é obrigatório.");
      return;
    }

    if (formData.nome.trim().length < 3) {
      showWarning(
        "Nome Muito Curto",
        "O nome da subcategoria deve ter pelo menos 3 caracteres."
      );
      return;
    }

    if (!formData.categoria_id) {
      showError(
        "Categoria Obrigatória",
        "Selecione uma categoria para a subcategoria."
      );
      return;
    }

    if (!hasChanges()) {
      showInfo("Nenhuma Alteração", "Não há alterações para salvar.");
      return;
    }

    try {
      setLoading(true);
      showInfo("Salvando", "Atualizando dados da subcategoria...");

      // Verificar se já existe outra subcategoria com o mesmo nome na mesma categoria
      if (
        formData.nome.trim() !== initialFormData.nome ||
        formData.categoria_id !== initialFormData.categoria_id
      ) {
        const { data: existingSubcategoria, error: checkError } = await supabase
          .from("subcategorias")
          .select("id, nome")
          .eq("categoria_id", formData.categoria_id)
          .ilike("nome", formData.nome.trim())
          .neq("id", subcategoriaId)
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
            `Já existe outra subcategoria com o nome "${formData.nome.trim()}" na categoria "${
              categoria?.nome
            }". Escolha um nome diferente.`
          );
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("subcategorias")
        .update({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          categoria_id: formData.categoria_id,
          ordem: formData.ordem,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subcategoriaId);

      if (error) throw error;

      showSuccess(
        "Subcategoria Atualizada",
        `A subcategoria "${formData.nome}" foi atualizada com sucesso!`
      );

      // Atualizar dados iniciais para refletir as mudanças
      setInitialFormData(formData);

      // Aguarda um pouco antes de redirecionar
      setTimeout(() => {
        router.push("/admin/subcategorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar subcategoria:", error);
      showError(
        "Erro na Atualização",
        "Ocorreu um erro ao atualizar a subcategoria. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!subcategoria) return;

    showWarning(
      "Confirmação de Exclusão",
      `Você está prestes a excluir a subcategoria "${subcategoria.nome}". Esta ação não pode ser desfeita.`
    );

    setTimeout(() => {
      if (
        !confirm(
          `Tem certeza que deseja excluir a subcategoria "${subcategoria.nome}"?\n\nEsta ação não pode ser desfeita.`
        )
      ) {
        showInfo("Operação Cancelada", "A subcategoria não foi excluída.");
        return;
      }

      performDelete();
    }, 1000);
  };

  const performDelete = async () => {
    if (!subcategoria) return;

    try {
      setLoading(true);
      showInfo("Excluindo", "Removendo subcategoria do sistema...");

      const { error } = await supabase
        .from("subcategorias")
        .delete()
        .eq("id", subcategoriaId);

      if (error) throw error;

      showSuccess(
        "Subcategoria Excluída",
        `A subcategoria "${subcategoria.nome}" foi excluída com sucesso!`
      );

      setTimeout(() => {
        router.push("/admin/subcategorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      showError(
        "Erro na Exclusão",
        "Ocorreu um erro ao excluir a subcategoria. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      showWarning(
        "Alterações Não Salvas",
        "Você possui alterações não salvas. Deseja realmente cancelar?"
      );

      setTimeout(() => {
        if (
          confirm("Você tem alterações não salvas. Deseja realmente cancelar?")
        ) {
          showInfo("Cancelando", "Retornando para a lista de subcategorias...");
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
              Carregando subcategoria...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!subcategoria) {
    return (
      <>
        {ToastComponent}
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Subcategoria não encontrada</p>
          <Link
            href="/admin/subcategorias"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700"
          >
            Voltar para Subcategorias
          </Link>
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Subcategoria
            </h1>
            <p className="text-gray-600 text-lg">
              Modificar informações da subcategoria &ldquo;{subcategoria.nome}
              &rdquo;
            </p>
          </div>

          {/* Botão de Excluir */}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <TrashIcon className="h-5 w-5" />
            )}
            <span>Excluir</span>
          </button>
        </div>

        {/* Indicador de alterações */}
        {hasChanges() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-yellow-800 text-base font-medium">
                Você tem alterações não salvas neste formulário.
              </p>
            </div>
          </div>
        )}

        {/* Formulário */}
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
                  loading ||
                  !formData.nome.trim() ||
                  !formData.categoria_id ||
                  !hasChanges()
                }
                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  "Salvar Alterações"
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

        {/* Informações da Subcategoria */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📊 Informações da Subcategoria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-base">
            <div>
              <span className="font-medium">ID:</span> {subcategoria.id}
            </div>
            <div>
              <span className="font-medium">Categoria atual:</span>{" "}
              {subcategoria.categorias?.nome || "Categoria não encontrada"}
            </div>
            <div>
              <span className="font-medium">Criada em:</span>{" "}
              {new Date(subcategoria.created_at).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{" "}
              {new Date(subcategoria.updated_at).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Status atual:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  subcategoria.status === "ativa"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {subcategoria.status === "ativa" ? "Ativa" : "Inativa"}
              </span>
            </div>
            <div>
              <span className="font-medium">Ordem atual:</span>{" "}
              {subcategoria.ordem}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
