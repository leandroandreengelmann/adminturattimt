"use client";

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onSetAsPrincipal?: () => void;
  isPrincipal?: boolean;
  index: number;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onSetAsPrincipal,
  isPrincipal = false,
  index,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações no frontend
    if (!file.type.startsWith("image/")) {
      setError("Apenas arquivos de imagem são permitidos");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `loja_${Date.now()}.${fileExt}`;
      const filePath = `lojas/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error("Erro no upload:", err);
      setError(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Imagem {index + 1}
        {isPrincipal && (
          <StarIcon className="inline h-4 w-4 text-yellow-500 ml-1" />
        )}
      </label>

      {!value ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Enviando...</p>
                </>
              ) : (
                <>
                  <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                </>
              )}
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden group">
            <img
              src={value}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              title="Remover imagem"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {onSetAsPrincipal && (
            <button
              type="button"
              onClick={onSetAsPrincipal}
              className={`w-full px-3 py-1 text-xs rounded transition-colors ${
                isPrincipal
                  ? "bg-yellow-100 text-yellow-800 font-medium"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isPrincipal ? "✓ Principal" : "Definir como principal"}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
