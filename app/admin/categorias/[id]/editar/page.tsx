"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  ordem: number;
  status: "ativa" | "inativa";
  created_at: string;
  updated_at: string;
}

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoriaId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ordem: 1,
    status: "ativa" as "ativa" | "inativa",
  });
  const [initialFormData, setInitialFormData] = useState({
    nome: "",
    descricao: "",
    ordem: 1,
    status: "ativa" as "ativa" | "inativa",
  });

  const { showSuccess, showError, showWarning, showInfo, ToastComponent } =
    useToast();

  useEffect(() => {
    if (categoriaId) {
      fetchCategoria();
    }
  }, [categoriaId]);

  const fetchCategoria = async () => {
    try {
      setLoadingPage(true);
      showInfo("Carregando", "Buscando dados da categoria...");

      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("id", categoriaId)
        .single();

      if (error) throw error;

      setCategoria(data);
      const formValues = {
        nome: data.nome,
        descricao: data.descricao || "",
        ordem: data.ordem || 1,
        status: data.status,
      };
      setFormData(formValues);
      setInitialFormData(formValues);

      showSuccess(
        "Categoria Carregada",
        `Dados da categoria "${data.nome}" carregados com sucesso.`
      );
    } catch (error) {
      console.error("Erro ao buscar categoria:", error);
      showError(
        "Categoria Não Encontrada",
        "A categoria solicitada não foi encontrada no sistema."
      );
      setTimeout(() => router.push("/admin/categorias"), 2000);
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
      showInfo("Nome Alterado", "O nome da categoria foi modificado.");
    }
    if (name === "status" && value !== initialFormData.status) {
      showWarning("Status Alterado", `Status alterado para "${value}".`);
    }
  };

  const hasChanges = () => {
    return (
      formData.nome !== initialFormData.nome ||
      formData.descricao !== initialFormData.descricao ||
      formData.ordem !== initialFormData.ordem ||
      formData.status !== initialFormData.status
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      showError("Campo Obrigatório", "O nome da categoria é obrigatório.");
      return;
    }

    if (formData.nome.trim().length < 3) {
      showWarning(
        "Nome Muito Curto",
        "O nome da categoria deve ter pelo menos 3 caracteres."
      );
      return;
    }

    if (!hasChanges()) {
      showInfo("Nenhuma Alteração", "Não há alterações para salvar.");
      return;
    }

    try {
      setLoading(true);
      showInfo("Salvando", "Atualizando dados da categoria...");

      // Verificar se já existe outra categoria com o mesmo nome
      if (formData.nome.trim() !== initialFormData.nome) {
        const { data: existingCategoria, error: checkError } = await supabase
          .from("categorias")
          .select("id, nome")
          .ilike("nome", formData.nome.trim())
          .neq("id", categoriaId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingCategoria) {
          showError(
            "Nome Já Existe",
            `Já existe outra categoria com o nome "${formData.nome.trim()}". Escolha um nome diferente.`
          );
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("categorias")
        .update({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          ordem: formData.ordem,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoriaId);

      if (error) throw error;

      showSuccess(
        "Categoria Atualizada",
        `A categoria "${formData.nome}" foi atualizada com sucesso!`
      );

      // Atualizar dados iniciais para refletir as mudanças
      setInitialFormData(formData);

      // Aguarda um pouco antes de redirecionar
      setTimeout(() => {
        router.push("/admin/categorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      showError(
        "Erro na Atualização",
        "Ocorreu um erro ao atualizar a categoria. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoria) return;

    showWarning(
      "Confirmação de Exclusão",
      `Você está prestes a excluir a categoria "${categoria.nome}". Esta ação não pode ser desfeita.`
    );

    setTimeout(() => {
      if (
        !confirm(
          `Tem certeza que deseja excluir a categoria "${categoria.nome}"?\n\nEsta ação não pode ser desfeita e pode afetar subcategorias relacionadas.`
        )
      ) {
        showInfo("Operação Cancelada", "A categoria não foi excluída.");
        return;
      }

      performDelete();
    }, 1000);
  };

  const performDelete = async () => {
    if (!categoria) return;

    try {
      setLoading(true);
      showInfo("Verificando", "Verificando dependências...");

      // Verificar se há subcategorias relacionadas
      const { data: subcategorias, error: subcategoriasError } = await supabase
        .from("subcategorias")
        .select("id, nome")
        .eq("categoria_id", categoriaId);

      if (subcategoriasError) throw subcategoriasError;

      if (subcategorias && subcategorias.length > 0) {
        showError(
          "Exclusão Bloqueada",
          `A categoria "${categoria.nome}" possui ${subcategorias.length} subcategoria(s) vinculada(s). Remova as subcategorias primeiro.`
        );
        setLoading(false);
        return;
      }

      showInfo("Excluindo", "Removendo categoria do sistema...");

      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", categoriaId);

      if (error) throw error;

      showSuccess(
        "Categoria Excluída",
        `A categoria "${categoria.nome}" foi excluída com sucesso!`
      );

      setTimeout(() => {
        router.push("/admin/categorias");
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      showError(
        "Erro na Exclusão",
        "Ocorreu um erro ao excluir a categoria. Tente novamente."
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
          showInfo("Cancelando", "Retornando para a lista de categorias...");
          setTimeout(() => router.push("/admin/categorias"), 1000);
        }
      }, 1000);
    } else {
      showInfo("Cancelando", "Retornando para a lista de categorias...");
      setTimeout(() => router.push("/admin/categorias"), 1000);
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
              Carregando categoria...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!categoria) {
    return (
      <>
        {ToastComponent}
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Categoria não encontrada</p>
          <Link
            href="/admin/categorias"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700"
          >
            Voltar para Categorias
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
              Editar Categoria
            </h1>
            <p className="text-gray-600 text-lg">
              Modificar informações da categoria &ldquo;{categoria.nome}&rdquo;
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
                Nome da Categoria *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Digite o nome da categoria"
              />
              <p className="mt-2 text-sm text-gray-500">
                Nome que será exibido para identificar a categoria
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
                  Status determina se a categoria estará visível no sistema
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !formData.nome.trim() || !hasChanges()}
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

        {/* Informações da Categoria */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📊 Informações da Categoria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-base">
            <div>
              <span className="font-medium">ID:</span> {categoria.id}
            </div>
            <div>
              <span className="font-medium">Criada em:</span>{" "}
              {new Date(categoria.created_at).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span>{" "}
              {new Date(categoria.updated_at).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Status atual:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  categoria.status === "ativa"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {categoria.status === "ativa" ? "Ativa" : "Inativa"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
