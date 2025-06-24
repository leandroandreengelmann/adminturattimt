"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeftIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Subcategoria {
  id: number;
  nome: string;
  descricao: string;
  slug: string;
  categoria_id: number;
  status: string;
  ordem: number;
  created_at: string;
}

interface Categoria {
  id: number;
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
    slug: "",
    categoria_id: "",
    status: "ativa",
    ordem: 0,
  });

  useEffect(() => {
    if (subcategoriaId) {
      fetchData();
    }
  }, [subcategoriaId]);

  const fetchData = async () => {
    try {
      setLoadingPage(true);

      // Buscar subcategoria
      const { data: subcategoriaData, error: subcategoriaError } =
        await supabase
          .from("subcategorias")
          .select("*")
          .eq("id", subcategoriaId)
          .single();

      if (subcategoriaError) throw subcategoriaError;

      // Buscar categorias para o select
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias")
        .select("id, nome")
        .eq("status", "ativa")
        .order("ordem", { ascending: true });

      if (categoriasError) throw categoriasError;

      setSubcategoria(subcategoriaData);
      setCategorias(categoriasData || []);
      setFormData({
        nome: subcategoriaData.nome,
        descricao: subcategoriaData.descricao || "",
        slug: subcategoriaData.slug || "",
        categoria_id: subcategoriaData.categoria_id.toString(),
        status: subcategoriaData.status,
        ordem: subcategoriaData.ordem || 0,
      });
    } catch (error) {
      console.error("Erro ao buscar subcategoria:", error);
      alert("Subcategoria não encontrada");
      router.push("/admin/subcategorias");
    } finally {
      setLoadingPage(false);
    }
  };

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
      [name]: value,
      // Auto-gerar slug quando nome mudar
      ...(name === "nome" && { slug: generateSlug(value) }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    if (!formData.slug.trim()) {
      alert("Slug é obrigatório");
      return;
    }

    if (!formData.categoria_id) {
      alert("Categoria é obrigatória");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("subcategorias")
        .update({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim() || null,
          slug: formData.slug.trim(),
          categoria_id: parseInt(formData.categoria_id),
          status: formData.status,
          ordem: parseInt(formData.ordem.toString()) || 0,
        })
        .eq("id", subcategoriaId);

      if (error) throw error;

      router.push("/admin/subcategorias");
    } catch (error) {
      console.error("Erro ao atualizar subcategoria:", error);
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        alert("Já existe uma subcategoria com este nome nesta categoria");
      } else {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? error.message
            : "Erro desconhecido";
        alert("Erro ao atualizar subcategoria: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("subcategorias")
        .delete()
        .eq("id", subcategoriaId);

      if (error) throw error;

      router.push("/admin/subcategorias");
    } catch (error) {
      console.error("Erro ao excluir subcategoria:", error);
      alert("Erro ao excluir subcategoria");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando subcategoria...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!subcategoria) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Subcategoria não encontrada</p>
          <Link
            href="/admin/subcategorias"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para subcategorias
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/subcategorias"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Subcategoria
              </h1>
              <p className="text-gray-600">Editar {subcategoria.nome}</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Excluir
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome da subcategoria"
                />
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-amigavel"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL amigável (gerada automaticamente a partir do nome)
                </p>
              </div>

              {/* Categoria */}
              <div>
                <label
                  htmlFor="categoria_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Categoria *
                </label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  required
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id.toString()}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </div>

              {/* Ordem */}
              <div className="md:col-span-2">
                <label
                  htmlFor="ordem"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ordem
                </label>
                <input
                  type="number"
                  id="ordem"
                  name="ordem"
                  min="0"
                  value={formData.ordem}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Ordem de exibição dentro da categoria (0 = primeiro)
                </p>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                rows={4}
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição da subcategoria..."
              />
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Criado em:{" "}
                  {new Date(subcategoria.created_at).toLocaleDateString(
                    "pt-BR"
                  )}
                </span>
                <span>ID: {subcategoria.id}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/subcategorias"
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
