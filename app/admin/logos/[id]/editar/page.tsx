"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeftIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Logo {
  id: string;
  nome: string;
  tipo: "branca" | "azul";
  posicao: "cabecalho" | "rodape";
  imagem_url: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditarLogoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "branca" as "branca" | "azul",
    posicao: "cabecalho" as "cabecalho" | "rodape",
    imagem_url: "",
    ativo: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [logoId, setLogoId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setLogoId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (logoId) {
      carregarLogo();
    }
  }, [logoId]);

  const carregarLogo = async () => {
    try {
      const { data, error } = await supabase
        .from("logos")
        .select("*")
        .eq("id", logoId)
        .single();

      if (error) throw error;

      if (data) {
        setLogo(data);
        setFormData({
          nome: data.nome,
          tipo: data.tipo,
          posicao: data.posicao,
          imagem_url: data.imagem_url,
          ativo: data.ativo,
        });
        setImagePreview(data.imagem_url);
      }
    } catch (error) {
      console.error("Erro ao carregar logo:", error);
      alert("Erro ao carregar logo.");
      router.push("/admin/logos");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tipo
      if (!file.type.includes("image/")) {
        alert("Por favor, selecione apenas arquivos de imagem (PNG ou JPG).");
        return;
      }

      // Validação de tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }

      setImageFile(file);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.imagem_url;

    setUploading(true);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, imageFile);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert("Por favor, informe o nome do logo.");
      return;
    }

    setSaving(true);

    try {
      // Upload da nova imagem se houver
      const imageUrl = await uploadImage();

      // Atualizar no banco
      const { error } = await supabase
        .from("logos")
        .update({
          ...formData,
          imagem_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", logoId);

      if (error) throw error;

      alert("Logo atualizado com sucesso!");
      router.push("/admin/logos");
    } catch (error) {
      console.error("Erro ao atualizar logo:", error);
      alert("Erro ao atualizar logo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este logo? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from("logos").delete().eq("id", logoId);

      if (error) throw error;

      alert("Logo excluído com sucesso!");
      router.push("/admin/logos");
    } catch (error) {
      console.error("Erro ao excluir logo:", error);
      alert("Erro ao excluir logo. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const getTipoEmoji = (tipo: string) => {
    switch (tipo) {
      case "branca":
        return "⚪";
      case "azul":
        return "🔵";
      default:
        return "🖼️";
    }
  };

  const getPosicaoEmoji = (posicao: string) => {
    switch (posicao) {
      case "cabecalho":
        return "⬆️";
      case "rodape":
        return "⬇️";
      default:
        return "📍";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!logo) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Logo não encontrado
          </h1>
          <Link
            href="/admin/logos"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Voltar para logos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/logos"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Voltar
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Logo</h1>
              <p className="text-lg text-gray-600">
                Modifique as informações do logo
              </p>
            </div>
          </div>

          <button
            onClick={handleExcluir}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Excluir Logo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informações do Logo
              </h2>

              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nome do Logo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Ex: Logo Principal Branca - Cabeçalho"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label
                  htmlFor="tipo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tipo do Logo *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="branca">⚪ Branca</option>
                  <option value="azul">🔵 Azul</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Escolha a cor predominante do logo
                </p>
              </div>

              {/* Posição */}
              <div>
                <label
                  htmlFor="posicao"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Posição *
                </label>
                <select
                  id="posicao"
                  name="posicao"
                  value={formData.posicao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="cabecalho">⬆️ Cabeçalho</option>
                  <option value="rodape">⬇️ Rodapé</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Onde o logo será exibido no site
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="ativo"
                  className="text-sm font-medium text-gray-700"
                >
                  Logo ativo (será exibido no site)
                </label>
              </div>

              {/* Informações adicionais */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                <div>
                  Criado em: {new Date(logo.created_at).toLocaleString("pt-BR")}
                </div>
                <div>
                  Última atualização:{" "}
                  {new Date(logo.updated_at).toLocaleString("pt-BR")}
                </div>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Imagem do Logo
              </h2>

              <div>
                <label
                  htmlFor="imagem"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Arquivo de Imagem
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative w-48 h-32 mx-auto mb-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-contain rounded-lg"
                          onError={(
                            e: React.SyntheticEvent<HTMLImageElement>
                          ) => {
                            const target = e.currentTarget;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJldmlldyBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pgo8L3N2Zz4K";
                          }}
                        />
                      </div>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="imagem"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500"
                      >
                        <span>Trocar imagem</span>
                        <input
                          id="imagem"
                          name="imagem"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">ou arraste até aqui</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG ou JPG (máximo 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview com informações */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Preview das Informações
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Nome:</span>
                    <span className="text-sm font-medium">{formData.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Tipo:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getTipoEmoji(formData.tipo)} {formData.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Posição:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPosicaoEmoji(formData.posicao)} {formData.posicao}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formData.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formData.ativo ? "✅ Ativo" : "❌ Inativo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Link
              href="/admin/logos"
              className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Salvando..."
                : uploading
                ? "Enviando Imagem..."
                : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
