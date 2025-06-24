"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
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
  lojas?: {
    id: number;
    nome: string;
  };
}

interface Loja {
  id: number;
  nome: string;
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroLoja, setFiltroLoja] = useState("todas");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [vendedoresResponse, lojasResponse] = await Promise.all([
        supabase
          .from("vendedores")
          .select(
            `
            *,
            lojas (
              id,
              nome
            )
          `
          )
          .order("ordem", { ascending: true }),
        supabase
          .from("lojas")
          .select("id, nome")
          .eq("status", "ativa")
          .order("nome", { ascending: true }),
      ]);

      if (vendedoresResponse.error) throw vendedoresResponse.error;
      if (lojasResponse.error) throw lojasResponse.error;

      setVendedores(vendedoresResponse.data || []);
      setLojas(lojasResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const alternarStatus = async (id: number, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("vendedores")
        .update({ ativo: novoStatus })
        .eq("id", id);

      if (error) throw error;

      setVendedores(
        vendedores.map((vendedor) =>
          vendedor.id === id ? { ...vendedor, ativo: novoStatus } : vendedor
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const excluirVendedor = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este vendedor?")) return;

    try {
      const { error } = await supabase.from("vendedores").delete().eq("id", id);

      if (error) throw error;

      setVendedores(vendedores.filter((vendedor) => vendedor.id !== id));
    } catch (error) {
      console.error("Erro ao excluir vendedor:", error);
    }
  };

  const abrirWhatsApp = (whatsapp: string, nome: string) => {
    const numeroLimpo = whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/55${numeroLimpo}?text=Olá ${nome}, vim através do site da TurattiMT!`;
    window.open(url, "_blank");
  };

  const vendedoresFiltrados = vendedores.filter((vendedor) => {
    const matchBusca =
      vendedor.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (vendedor.especialidade &&
        vendedor.especialidade.toLowerCase().includes(busca.toLowerCase())) ||
      vendedor.whatsapp.includes(busca);

    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && vendedor.ativo) ||
      (filtroStatus === "inativo" && !vendedor.ativo);

    const matchLoja =
      filtroLoja === "todas" || vendedor.loja_id.toString() === filtroLoja;

    return matchBusca && matchStatus && matchLoja;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendedores</h1>
            <p className="text-lg text-gray-600 mt-1">
              Gerencie os vendedores das lojas ({vendedores.length}{" "}
              {vendedores.length === 1 ? "vendedor" : "vendedores"})
            </p>
          </div>
          <Link
            href="/admin/vendedores/novo"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            Novo Vendedor
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="busca"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Buscar
              </label>
              <input
                type="text"
                id="busca"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome, especialidade ou WhatsApp..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="loja"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Loja
              </label>
              <select
                id="loja"
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas as lojas</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id.toString()}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Vendedores */}
        {vendedoresFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg">
              {busca || filtroStatus !== "todos" || filtroLoja !== "todas"
                ? "Nenhum vendedor encontrado com os filtros aplicados."
                : "Nenhum vendedor cadastrado."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendedoresFiltrados.map((vendedor) => (
              <div
                key={vendedor.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {vendedor.foto_url ? (
                        <Image
                          src={vendedor.foto_url}
                          alt={vendedor.nome}
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-gray-500">
                            {vendedor.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vendedor.nome}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vendedor.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {vendedor.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        alternarStatus(vendedor.id, !vendedor.ativo)
                      }
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        vendedor.ativo
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={vendedor.ativo ? "Desativar" : "Ativar"}
                    >
                      {vendedor.ativo ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>

                    <Link
                      href={`/admin/vendedores/${vendedor.id}/editar`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>

                    <button
                      onClick={() => excluirVendedor(vendedor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Excluir"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {vendedor.especialidade && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Especialidade:
                      </span>
                      <p className="text-sm text-gray-600">
                        {vendedor.especialidade}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Loja:
                    </span>
                    <p className="text-sm text-gray-600">
                      {vendedor.lojas?.nome}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        WhatsApp:
                      </span>
                      <p className="text-sm text-gray-600">
                        {vendedor.whatsapp}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        abrirWhatsApp(vendedor.whatsapp, vendedor.nome)
                      }
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                      title="Abrir WhatsApp"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      Contatar
                    </button>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Ordem: {vendedor.ordem}</span>
                    <span>
                      Criado em:{" "}
                      {new Date(vendedor.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
