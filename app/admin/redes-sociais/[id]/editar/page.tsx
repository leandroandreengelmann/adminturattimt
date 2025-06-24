"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

interface RedeSocial {
  id: number;
  nome: string;
  link: string;
  icone: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

// Opções de ícones disponíveis
const iconeOptions = [
  { value: "instagram", label: "Instagram", emoji: "📷" },
  { value: "facebook", label: "Facebook", emoji: "📘" },
  { value: "twitter", label: "Twitter", emoji: "🐦" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "youtube", label: "YouTube", emoji: "📺" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
  { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { value: "telegram", label: "Telegram", emoji: "✈️" },
  { value: "pinterest", label: "Pinterest", emoji: "📌" },
  { value: "snapchat", label: "Snapchat", emoji: "👻" },
  { value: "discord", label: "Discord", emoji: "🎮" },
  { value: "github", label: "GitHub", emoji: "💻" },
  { value: "website", label: "Website", emoji: "🌐" },
  { value: "email", label: "Email", emoji: "📧" },
  { value: "phone", label: "Telefone", emoji: "📞" },
];

export default function EditarRedeSocialPage() {
  const router = useRouter();
  const params = useParams();
  const redeSocialId = params.id as string;

  const [redeSocial, setRedeSocial] = useState<RedeSocial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    link: "",
    icone: "instagram",
    ativo: true,
    ordem: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (redeSocialId) {
      carregarRedeSocial();
    }
  }, [redeSocialId]);

  const carregarRedeSocial = async () => {
    try {
      const { data, error } = await supabase
        .from("redes_sociais")
        .select("*")
        .eq("id", redeSocialId)
        .single();

      if (error) throw error;

      setRedeSocial(data);
      setFormData({
        nome: data.nome,
        link: data.link,
        icone: data.icone,
        ativo: data.ativo,
        ordem: data.ordem,
      });
    } catch (error) {
      console.error("Erro ao carregar rede social:", error);
      router.push("/admin/redes-sociais");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link é obrigatório";
    } else if (
      !formData.link.startsWith("http://") &&
      !formData.link.startsWith("https://")
    ) {
      newErrors.link = "Link deve começar com http:// ou https://";
    }

    if (!formData.icone) {
      newErrors.icone = "Ícone é obrigatório";
    }

    if (formData.ordem < 0) {
      newErrors.ordem = "Ordem deve ser um número positivo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaveLoading(true);

    try {
      const { error } = await supabase
        .from("redes_sociais")
        .update(formData)
        .eq("id", redeSocialId);

      if (error) throw error;

      router.push("/admin/redes-sociais");
    } catch (error) {
      console.error("Erro ao atualizar rede social:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Erro ao atualizar rede social",
      }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta rede social? Esta ação não pode ser desfeita."
      )
    )
      return;

    setSaveLoading(true);

    try {
      const { error } = await supabase
        .from("redes_sociais")
        .delete()
        .eq("id", redeSocialId);

      if (error) throw error;

      router.push("/admin/redes-sociais");
    } catch (error) {
      console.error("Erro ao excluir rede social:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao excluir rede social" }));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const selectedIcon = iconeOptions.find(
    (option) => option.value === formData.icone
  );

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

  if (!redeSocial) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Rede social não encontrada
          </h1>
          <Link
            href="/admin/redes-sociais"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Voltar para redes sociais
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
              href="/admin/redes-sociais"
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Rede Social
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                ID: {redeSocial.id} • Criado em:{" "}
                {new Date(redeSocial.created_at).toLocaleDateString("pt-BR")}
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informações da Rede Social
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
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
                  placeholder="Ex: Instagram"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>

              {/* Ícone */}
              <div>
                <label
                  htmlFor="icone"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Ícone *
                </label>
                <select
                  id="icone"
                  name="icone"
                  value={formData.icone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.icone ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  {iconeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
                {errors.icone && (
                  <p className="mt-1 text-sm text-red-600">{errors.icone}</p>
                )}
              </div>

              {/* Link */}
              <div className="md:col-span-2">
                <label
                  htmlFor="link"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Link *
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.link ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="https://instagram.com/seuusuario"
                />
                {errors.link && (
                  <p className="mt-1 text-sm text-red-600">{errors.link}</p>
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

          {/* Preview */}
          {selectedIcon && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preview
              </h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl">{selectedIcon.emoji}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formData.nome}
                  </h3>
                  <p className="text-sm text-gray-600">{formData.link}</p>
                </div>
                <span
                  className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    formData.ativo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formData.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Criado em:</span>{" "}
                {new Date(redeSocial.created_at).toLocaleString("pt-BR")}
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span>{" "}
                {new Date(redeSocial.updated_at).toLocaleString("pt-BR")}
              </div>
              <div>
                <span className="font-medium">Status atual:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
                    redeSocial.ativo
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {redeSocial.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div>
                <span className="font-medium">Ordem:</span> {redeSocial.ordem}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/redes-sociais"
              className="px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {saveLoading ? "Salvando..." : "Salvar Alterações"}
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
