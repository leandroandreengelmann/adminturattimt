"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Vendedor {
  id: number;
  nome: string;
  especialidade: string | null;
  whatsapp: string;
  foto_url: string | null;
  loja_id: number;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

interface Loja {
  id: number;
  nome: string;
}

export default function EditarVendedorPage() {
  const router = useRouter();
  const params = useParams();
  const vendedorId = params.id as string;

  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    especialidade: "",
    whatsapp: "",
    loja_id: "",
    ativo: true,
    ordem: 0,
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string>("");
  const [fotoAtual, setFotoAtual] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (vendedorId) {
      Promise.all([carregarVendedor(), carregarLojas()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendedorId]);

  const carregarVendedor = async () => {
    try {
      const { data, error } = await supabase
        .from("vendedores")
        .select("*")
        .eq("id", vendedorId)
        .single();

      if (error) throw error;

      setVendedor(data);
      setFormData({
        nome: data.nome,
        especialidade: data.especialidade || "",
        whatsapp: formatWhatsApp(data.whatsapp),
        loja_id: data.loja_id.toString(),
        ativo: data.ativo,
        ordem: data.ordem,
      });
      setFotoAtual(data.foto_url || "");
    } catch (error) {
      console.error("Erro ao carregar vendedor:", error);
      router.push("/admin/vendedores");
    } finally {
      setLoading(false);
    }
  };

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome")
        .eq("status", "ativa")
        .order("nome", { ascending: true });

      if (error) throw error;
      setLojas(data || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (!/^\d{10,11}$/.test(formData.whatsapp.replace(/\D/g, ""))) {
      newErrors.whatsapp = "WhatsApp deve ter 10 ou 11 dígitos";
    }

    if (!formData.loja_id) {
      newErrors.loja_id = "Loja é obrigatória";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem deve ser um número positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, foto: "Arquivo deve ser uma imagem" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, foto: "Imagem deve ter no máximo 5MB" }));
      return;
    }

    setFoto(file);
    setErrors((prev) => ({ ...prev, foto: "" }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewFoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!foto) return fotoAtual;

    setUploadingImage(true);
    try {
      const fileExt = foto.name.split(".").pop();
      const fileName = `vendedor_${Date.now()}.${fileExt}`;
      const filePath = `vendedores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, foto);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erro no upload:", error);
      setErrors((prev) => ({
        ...prev,
        foto: "Erro ao fazer upload da imagem",
      }));
      return fotoAtual;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaveLoading(true);

    try {
      const foto_url = await uploadImage();

      const vendedorData = {
        ...formData,
        loja_id: parseInt(formData.loja_id),
        whatsapp: formData.whatsapp.replace(/\D/g, ""),
        especialidade: formData.especialidade.trim() || null,
        foto_url: foto_url || null,
      };

      const { error } = await supabase
        .from("vendedores")
        .update(vendedorData)
        .eq("id", vendedorId);

      if (error) throw error;

      router.push("/admin/vendedores");
    } catch (error) {
      console.error("Erro ao atualizar vendedor:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao atualizar vendedor" }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este vendedor? Esta ação não pode ser desfeita."
      )
    )
      return;

    setSaveLoading(true);

    try {
      const { error } = await supabase
        .from("vendedores")
        .delete()
        .eq("id", vendedorId);

      if (error) throw error;

      router.push("/admin/vendedores");
    } catch (error) {
      console.error("Erro ao excluir vendedor:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao excluir vendedor" }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7
      )}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData((prev) => ({ ...prev, whatsapp: formatted }));

    if (errors.whatsapp) {
      setErrors((prev) => ({ ...prev, whatsapp: "" }));
    }
  };

  const removeImage = () => {
    setFoto(null);
    setPreviewFoto("");
    setFotoAtual("");
    setErrors((prev) => ({ ...prev, foto: "" }));

    const fileInput = document.getElementById("foto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const getCurrentImage = () => {
    if (previewFoto) return previewFoto;
    if (fotoAtual) return fotoAtual;
    return "";
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

  if (!vendedor) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Vendedor não encontrado
          </h1>
          <Link
            href="/admin/vendedores"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Voltar para vendedores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/vendedores"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Vendedor
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                ID: {vendedor.id} • Criado em:{" "}
                {new Date(vendedor.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={saveLoading}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5" />
            Excluir
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informações do Vendedor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="nome"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nome ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Ex: João Silva"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  WhatsApp *
                </label>
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.whatsapp ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="especialidade"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Especialidade
                </label>
                <textarea
                  id="especialidade"
                  name="especialidade"
                  value={formData.especialidade}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Produtos Eletrônicos, Consultoria Técnica..."
                />
              </div>

              <div>
                <label
                  htmlFor="loja_id"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Loja *
                </label>
                <select
                  id="loja_id"
                  name="loja_id"
                  value={formData.loja_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.loja_id ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma loja</option>
                  {lojas.map((loja) => (
                    <option key={loja.id} value={loja.id.toString()}>
                      {loja.nome}
                    </option>
                  ))}
                </select>
                {errors.loja_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.loja_id}</p>
                )}
              </div>

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

              <div className="md:col-span-2">
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Foto de Perfil
            </h2>

            {!getCurrentImage() ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PhotoIcon className="mx-auto h-16 w-16 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="foto" className="cursor-pointer">
                    <span className="mt-2 block text-base font-medium text-gray-900">
                      Escolher foto de perfil
                    </span>
                    <span className="mt-1 block text-base text-gray-500">
                      PNG ou JPG (máx. 5MB)
                    </span>
                    <input
                      id="foto"
                      name="foto"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Image
                  src={getCurrentImage()}
                  alt="Foto atual"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-1/2 transform translate-x-16 -translate-y-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>

                <div className="mt-4 text-center">
                  <label
                    htmlFor="foto"
                    className="cursor-pointer text-blue-600 hover:text-blue-700"
                  >
                    Alterar foto
                    <input
                      id="foto"
                      name="foto"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
            )}

            {errors.foto && (
              <p className="mt-2 text-sm text-red-600 text-center">
                {errors.foto}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Preview
            </h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getCurrentImage() ? (
                  <Image
                    src={getCurrentImage()}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-500">
                      {formData.nome
                        ? formData.nome.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formData.nome}
                </h3>
                {formData.especialidade && (
                  <p className="text-sm text-gray-600">
                    {formData.especialidade}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  {formData.whatsapp} •{" "}
                  {
                    lojas.find((l) => l.id.toString() === formData.loja_id)
                      ?.nome
                  }
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.ativo
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {formData.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Criado em:</span>{" "}
                {new Date(vendedor.created_at).toLocaleString("pt-BR")}
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span>{" "}
                {new Date(vendedor.updated_at).toLocaleString("pt-BR")}
              </div>
              <div>
                <span className="font-medium">Status atual:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    vendedor.ativo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vendedor.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div>
                <span className="font-medium">Ordem:</span> {vendedor.ordem}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/vendedores"
              className="px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saveLoading || uploadingImage}
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saveLoading
                ? "Salvando..."
                : uploadingImage
                ? "Enviando foto..."
                : "Salvar Alterações"}
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
