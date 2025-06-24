"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/Toast";
import {
  FolderIcon,
  TagIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  EyeIcon,
  SparklesIcon,
  PaintBrushIcon,
  PhotoIcon,
  RectangleStackIcon,
  ShareIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface Estatisticas {
  totalCategorias: number;
  totalSubcategorias: number;
  categoriasAtivas: number;
  subcategoriasAtivas: number;
  totalProdutos: number;
  produtosAtivos: number;
  produtosPromocao: number;
  produtosNovidade: number;
  totalBanners: number;
  bannersAtivos: number;
  totalLogos: number;
  logosAtivos: number;
  totalRedesSociais: number;
  redesSociaisAtivas: number;
  totalVendedores: number;
  vendedoresAtivos: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Estatisticas>({
    totalCategorias: 0,
    totalSubcategorias: 0,
    categoriasAtivas: 0,
    subcategoriasAtivas: 0,
    totalProdutos: 0,
    produtosAtivos: 0,
    produtosPromocao: 0,
    produtosNovidade: 0,
    totalBanners: 0,
    bannersAtivos: 0,
    totalLogos: 0,
    logosAtivos: 0,
    totalRedesSociais: 0,
    redesSociaisAtivas: 0,
    totalVendedores: 0,
    vendedoresAtivos: 0,
  });

  const [loading, setLoading] = useState(true);

  const { showSuccess, showError, showInfo, ToastComponent } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      showInfo("Carregando Dashboard", "Buscando dados do sistema...");

      // Buscar estatísticas em paralelo
      const [
        categoriasResponse,
        subcategoriasResponse,
        produtosResponse,
        bannersResponse,
        logosResponse,
        redesSociaisResponse,
        vendedoresResponse,
      ] = await Promise.all([
        supabase.from("categorias").select("id, status"),
        supabase.from("subcategorias").select("id, status"),
        supabase.from("produtos").select("id, status, promocao_mes, novidade"),
        supabase.from("banners").select("id, ativo"),
        supabase.from("logos").select("id, ativo"),
        supabase.from("redes_sociais").select("id, ativo"),
        supabase.from("vendedores").select("id, ativo"),
      ]);

      if (categoriasResponse.error) throw categoriasResponse.error;
      if (subcategoriasResponse.error) throw subcategoriasResponse.error;
      if (produtosResponse.error) throw produtosResponse.error;
      if (bannersResponse.error) throw bannersResponse.error;
      if (logosResponse.error) throw logosResponse.error;
      if (redesSociaisResponse.error) throw redesSociaisResponse.error;
      if (vendedoresResponse.error) throw vendedoresResponse.error;

      const categorias = categoriasResponse.data || [];
      const subcategorias = subcategoriasResponse.data || [];
      const produtos = produtosResponse.data || [];
      const banners = bannersResponse.data || [];
      const logos = logosResponse.data || [];
      const redesSociais = redesSociaisResponse.data || [];
      const vendedores = vendedoresResponse.data || [];

      const estatisticas = {
        totalCategorias: categorias.length,
        totalSubcategorias: subcategorias.length,
        categoriasAtivas: categorias.filter((c) => c.status === "ativa").length,
        subcategoriasAtivas: subcategorias.filter((s) => s.status === "ativa")
          .length,
        totalProdutos: produtos.length,
        produtosAtivos: produtos.filter((p) => p.status === "ativo").length,
        produtosPromocao: produtos.filter((p) => p.promocao_mes === true)
          .length,
        produtosNovidade: produtos.filter((p) => p.novidade === true).length,
        totalBanners: banners.length,
        bannersAtivos: banners.filter((b) => b.ativo === true).length,
        totalLogos: logos.length,
        logosAtivos: logos.filter((l) => l.ativo === true).length,
        totalRedesSociais: redesSociais.length,
        redesSociaisAtivas: redesSociais.filter((r) => r.ativo === true).length,
        totalVendedores: vendedores.length,
        vendedoresAtivos: vendedores.filter((v) => v.ativo === true).length,
      };

      setStats(estatisticas);

      showSuccess(
        "Dashboard Atualizado",
        `Sistema carregado: ${estatisticas.totalCategorias} categorias, ${estatisticas.totalSubcategorias} subcategorias e ${estatisticas.totalProdutos} produtos.`
      );
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar as estatísticas do sistema."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToSection = (section: string, title: string) => {
    showInfo(
      `Navegando para ${title}`,
      `Abrindo a seção de ${title.toLowerCase()}...`
    );
    router.push(section);
  };

  if (loading) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">
              Carregando dashboard...
            </p>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-lg">
              Visão geral do sistema administrativo
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas - Categorias e Subcategorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Categorias */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCategorias}
                </p>
                <p className="text-base text-gray-600">Total de Categorias</p>
              </div>
            </div>
          </div>

          {/* Categorias Ativas */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.categoriasAtivas}
                </p>
                <p className="text-base text-gray-600">Categorias Ativas</p>
              </div>
            </div>
          </div>

          {/* Total de Subcategorias */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <TagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalSubcategorias}
                </p>
                <p className="text-base text-gray-600">
                  Total de Subcategorias
                </p>
              </div>
            </div>
          </div>

          {/* Subcategorias Ativas */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.subcategoriasAtivas}
                </p>
                <p className="text-base text-gray-600">Subcategorias Ativas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Produtos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <TagIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProdutos}
                </p>
                <p className="text-base text-gray-600">Total de Produtos</p>
              </div>
            </div>
          </div>

          {/* Produtos Ativos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.produtosAtivos}
                </p>
                <p className="text-base text-gray-600">Produtos Ativos</p>
              </div>
            </div>
          </div>

          {/* Produtos em Promoção */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                <SparklesIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.produtosPromocao}
                </p>
                <p className="text-base text-gray-600">Em Promoção</p>
              </div>
            </div>
          </div>

          {/* Produtos Novidade */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-rose-100 rounded-lg flex items-center justify-center mr-4">
                <PaintBrushIcon className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.produtosNovidade}
                </p>
                <p className="text-base text-gray-600">Novidades</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Banners, Logos, Redes Sociais e Vendedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Banners */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-cyan-100 rounded-lg flex items-center justify-center mr-4">
                <PhotoIcon className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBanners}
                </p>
                <p className="text-base text-gray-600">Total de Banners</p>
              </div>
            </div>
          </div>

          {/* Banners Ativos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.bannersAtivos}
                </p>
                <p className="text-base text-gray-600">Banners Ativos</p>
              </div>
            </div>
          </div>

          {/* Total de Logos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <RectangleStackIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLogos}
                </p>
                <p className="text-base text-gray-600">Total de Logos</p>
              </div>
            </div>
          </div>

          {/* Logos Ativos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.logosAtivos}
                </p>
                <p className="text-base text-gray-600">Logos Ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Redes Sociais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Redes Sociais */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-violet-100 rounded-lg flex items-center justify-center mr-4">
                <ShareIcon className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRedesSociais}
                </p>
                <p className="text-base text-gray-600">Total de Redes</p>
              </div>
            </div>
          </div>

          {/* Redes Sociais Ativas */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                <EyeIcon className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.redesSociaisAtivas}
                </p>
                <p className="text-base text-gray-600">Redes Ativas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Vendedores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Vendedores */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-slate-100 rounded-lg flex items-center justify-center mr-4">
                <UserIcon className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVendedores}
                </p>
                <p className="text-base text-gray-600">Total de Vendedores</p>
              </div>
            </div>
          </div>

          {/* Vendedores Ativos */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.vendedoresAtivos}
                </p>
                <p className="text-base text-gray-600">Vendedores Ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nova Categoria */}
            <button
              onClick={() =>
                navigateToSection("/admin/categorias/nova", "Nova Categoria")
              }
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Nova Categoria
              </h3>
              <p className="text-base text-gray-600 mt-1">
                Criar nova categoria
              </p>
            </button>

            {/* Novo Produto */}
            <button
              onClick={() =>
                navigateToSection("/admin/produtos/novo", "Novo Produto")
              }
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Novo Produto
              </h3>
              <p className="text-base text-gray-600 mt-1">
                Cadastrar novo produto
              </p>
            </button>

            {/* Nova Subcategoria */}
            <button
              onClick={() =>
                navigateToSection(
                  "/admin/subcategorias/nova",
                  "Nova Subcategoria"
                )
              }
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Nova Subcategoria
              </h3>
              <p className="text-base text-gray-600 mt-1">
                Criar nova subcategoria
              </p>
            </button>

            {/* Novo Banner */}
            <button
              onClick={() =>
                navigateToSection("/admin/banners/novo", "Novo Banner")
              }
              className="flex flex-col items-center p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Novo Banner
              </h3>
              <p className="text-base text-gray-600 mt-1">Criar novo banner</p>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Nova Rede Social */}
            <button
              onClick={() =>
                navigateToSection(
                  "/admin/redes-sociais/nova",
                  "Nova Rede Social"
                )
              }
              className="flex flex-col items-center p-4 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-violet-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Nova Rede Social
              </h3>
              <p className="text-base text-gray-600 mt-1">
                Adicionar rede social
              </p>
            </button>

            {/* Novo Vendedor */}
            <button
              onClick={() =>
                navigateToSection("/admin/vendedores/novo", "Novo Vendedor")
              }
              className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center"
            >
              <div className="h-12 w-12 bg-slate-600 rounded-lg flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Novo Vendedor
              </h3>
              <p className="text-base text-gray-600 mt-1">Cadastrar vendedor</p>
            </button>
          </div>
        </div>

        {/* Navegação Rápida */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Seções do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categorias */}
            <button
              onClick={() =>
                navigateToSection("/admin/categorias", "Categorias")
              }
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <FolderIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Categorias
                </h3>
                <p className="text-base text-gray-600">
                  {stats.totalCategorias} categorias cadastradas
                </p>
              </div>
            </button>

            {/* Subcategorias */}
            <button
              onClick={() =>
                navigateToSection("/admin/subcategorias", "Subcategorias")
              }
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <TagIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Subcategorias
                </h3>
                <p className="text-base text-gray-600">
                  {stats.totalSubcategorias} subcategorias cadastradas
                </p>
              </div>
            </button>

            {/* Produtos */}
            <button
              onClick={() => navigateToSection("/admin/produtos", "Produtos")}
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <TagIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Produtos
                </h3>
                <p className="text-base text-gray-600">
                  {stats.totalProdutos} produtos cadastrados
                </p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Vendedores */}
            <button
              onClick={() =>
                navigateToSection("/admin/vendedores", "Vendedores")
              }
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="h-10 w-10 bg-slate-600 rounded-lg flex items-center justify-center mr-4">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Vendedores
                </h3>
                <p className="text-base text-gray-600">
                  {stats.totalVendedores} vendedores cadastrados
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Atualização Manual */}
        <div className="text-center">
          <button
            onClick={() => {
              showInfo("Atualizando", "Recarregando dados do dashboard...");
              fetchDashboardData();
            }}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white text-lg font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Atualizar Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
