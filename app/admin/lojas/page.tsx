"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface Loja {
  id: number;
  nome: string;
  telefones: string[];
  endereco: string;
  horario_funcionamento: string;
  status: string;
  ordem: number;
  imagem_principal: string | null;
  imagem_2: string | null;
  imagem_3: string | null;
  imagem_4: string | null;
  imagem_5: string | null;
  imagem_6: string | null;
  imagem_7: string | null;
  imagem_8: string | null;
  imagem_9: string | null;
  imagem_10: string | null;
  imagem_principal_index: number;
  created_at: string;
  updated_at: string;
}

export default function LojasPage() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const { ToastComponent, showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    fetchLojas();
  }, []);

  const fetchLojas = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .order("ordem", { ascending: true })
        .order("nome", { ascending: true });

      if (error) throw error;

      setLojas(data || []);
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
      showError(
        "Erro ao Carregar",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as lojas."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (loja: Loja) => {
    if (
      !confirm(
        `Tem certeza que deseja EXCLUIR a loja "${loja.nome}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      showInfo("Excluindo", `Removendo "${loja.nome}" do sistema...`);

      const { error } = await supabase.from("lojas").delete().eq("id", loja.id);

      if (error) throw error;

      showSuccess("Loja Excluída", `"${loja.nome}" foi removida com sucesso.`);
      fetchLojas();
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      showError(
        "Erro na Exclusão",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a loja."
      );
    }
  };

  const toggleStatus = async (loja: Loja) => {
    try {
      const novoStatus = loja.status === "ativa" ? "inativa" : "ativa";
      showInfo(
        "Atualizando",
        `${novoStatus === "ativa" ? "Ativando" : "Desativando"} "${
          loja.nome
        }"...`
      );

      const { error } = await supabase
        .from("lojas")
        .update({ status: novoStatus })
        .eq("id", loja.id);

      if (error) throw error;

      showSuccess(
        "Status Atualizado",
        `"${loja.nome}" foi ${
          novoStatus === "ativa" ? "ativada" : "desativada"
        } com sucesso.`
      );
      fetchLojas();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      showError(
        "Erro na Atualização",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status."
      );
    }
  };

  const lojasFiltradas = lojas.filter(
    (loja) =>
      loja.nome.toLowerCase().includes(busca.toLowerCase()) ||
      loja.telefones.some((tel) => tel.includes(busca)) ||
      loja.endereco.toLowerCase().includes(busca.toLowerCase())
  );

  const formatTelefone = (telefone: string) => {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, "");

    // Aplica máscara baseada no tamanho
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return telefone;
  };

  const getImagemPrincipal = (loja: Loja) => {
    const imagens = [
      loja.imagem_principal,
      loja.imagem_2,
      loja.imagem_3,
      loja.imagem_4,
      loja.imagem_5,
      loja.imagem_6,
      loja.imagem_7,
      loja.imagem_8,
      loja.imagem_9,
      loja.imagem_10,
    ];

    const imagemPrincipal = imagens[loja.imagem_principal_index];
    return imagemPrincipal || imagens.find((img) => img) || null;
  };

  const getTotalImagens = (loja: Loja) => {
    const imagens = [
      loja.imagem_principal,
      loja.imagem_2,
      loja.imagem_3,
      loja.imagem_4,
      loja.imagem_5,
      loja.imagem_6,
      loja.imagem_7,
      loja.imagem_8,
      loja.imagem_9,
      loja.imagem_10,
    ];

    return imagens.filter((img) => img && img.trim() !== "").length;
  };

  if (loading) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">Carregando lojas...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
            <p className="text-gray-600 text-lg">
              Gerencie as lojas da empresa
            </p>
          </div>
          <Link
            href="/admin/lojas/nova"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Loja
          </Link>
        </div>

        {/* Busca */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lojas.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {lojas.filter((loja) => loja.status === "ativa").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-red-600 rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inativas</p>
                <p className="text-2xl font-bold text-red-600">
                  {lojas.filter((loja) => loja.status === "inativa").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Lojas */}
        {lojasFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {busca ? "Nenhuma loja encontrada" : "Nenhuma loja cadastrada"}
            </h3>
            <p className="text-gray-600 mb-4">
              {busca
                ? "Tente ajustar os termos de busca."
                : "Comece cadastrando a primeira loja da empresa."}
            </p>
            {!busca && (
              <Link
                href="/admin/lojas/nova"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Cadastrar Primera Loja
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lojasFiltradas.map((loja) => (
              <div
                key={loja.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Imagem Principal */}
                <div className="relative h-48 bg-gray-100">
                  {getImagemPrincipal(loja) ? (
                    <>
                      <img
                        src={getImagemPrincipal(loja)!}
                        alt={`Foto principal da loja ${loja.nome}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm flex items-center">
                        <PhotoIcon className="h-4 w-4 mr-1" />
                        {getTotalImagens(loja)}/10
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {loja.nome}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            loja.status === "ativa"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {loja.status === "ativa" ? "Ativa" : "Inativa"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telefones */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        {loja.telefones && loja.telefones.length > 0 ? (
                          loja.telefones.map((telefone, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {formatTelefone(telefone)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">
                            Nenhum telefone cadastrado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="flex items-start mb-3">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {loja.endereco}
                    </p>
                  </div>

                  {/* Horário */}
                  <div className="flex items-start mb-4">
                    <ClockIcon className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {loja.horario_funcionamento}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleStatus(loja)}
                      className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                        loja.status === "ativa"
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {loja.status === "ativa" ? "Desativar" : "Ativar"}
                    </button>

                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/lojas/${loja.id}/editar`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar loja"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(loja)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir loja"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
