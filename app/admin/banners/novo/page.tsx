"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function NovoBannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    imagem_url: "",
    ativo: true,
    ordem: 0,
    link_destino: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        imagem: "Por favor, selecione um arquivo de imagem válido",
      }));
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        imagem: "A imagem deve ter no máximo 5MB",
      }));
      return;
    }

    setUploadLoading(true);
    setErrors((prev) => ({ ...prev, imagem: "" }));

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      // Upload para o Supabase Storage
      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (error) throw error;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, imagem_url: publicUrl }));
      setImagePreview(publicUrl);
    } catch (error) {
      console.error("Erro no upload:", error);
      setErrors((prev) => ({
        ...prev,
        imagem: "Erro ao fazer upload da imagem",
      }));
    } finally {
      setUploadLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.imagem_url) {
      newErrors.imagem = "Imagem é obrigatória";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem deve ser um número positivo";
    }

    if (formData.link_destino && !formData.link_destino.startsWith("http")) {
      newErrors.link_destino = "Link deve começar com http:// ou https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("banners").insert([formData]);

      if (error) throw error;

      router.push("/admin/banners");
    } catch (error) {
      console.error("Erro ao criar banner:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao criar banner" }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));

    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/banners"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Banner</h1>
            <p className="text-lg text-gray-600 mt-1">
              Adicione um novo banner ao site (1500x500px)
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informações do Banner
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label
                  htmlFor="titulo"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.titulo ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Digite o título do banner..."
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
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
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descrição opcional do banner..."
                />
              </div>

              {/* Link Destino */}
              <div className="md:col-span-2">
                <label
                  htmlFor="link_destino"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Link de Destino
                </label>
                <input
                  type="url"
                  id="link_destino"
                  name="link_destino"
                  value={formData.link_destino}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.link_destino ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="https://exemplo.com"
                />
                {errors.link_destino && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.link_destino}
                  </p>
                )}
              </div>

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
                  min="0"
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ordem ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.ordem && (
                  <p className="mt-1 text-sm text-red-600">{errors.ordem}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="ativo"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="ativo"
                  name="ativo"
                  value={formData.ativo.toString()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ativo: e.target.value === "true",
                    }))
                  }
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Imagem do Banner
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                    imagePreview
                      ? "border-green-300 bg-green-50 hover:bg-green-100"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="mb-2 text-base text-gray-500">
                        <span className="font-semibold">
                          Clique para fazer upload
                        </span>{" "}
                        ou arraste a imagem
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG ou JPG (Recomendado: 1500x500px, máx. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadLoading}
                  />
                </label>
              </div>

              {uploadLoading && (
                <div className="text-center text-blue-600">
                  Fazendo upload da imagem...
                </div>
              )}

              {errors.imagem && (
                <p className="text-sm text-red-600">{errors.imagem}</p>
              )}

              {imagePreview && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, imagem_url: "" }));
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remover imagem
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/banners"
              className="px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || uploadLoading}
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? "Salvando..." : "Salvar Banner"}
            </button>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
}
