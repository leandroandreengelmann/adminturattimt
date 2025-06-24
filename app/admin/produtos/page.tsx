"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import CountdownTimer from "@/components/CountdownTimer";
import { usePromocaoUpdater } from "@/hooks/usePromocaoUpdater";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import {
  MagnifyingGlassIcon,
  TrashIcon,
  TagIcon,
  SparklesIcon,
  PaintBrushIcon,
  BoltIcon,
  PlusIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  promocao_mes: boolean;
  preco_promocao?: number;
  promocao_data_inicio?: string;
  promocao_data_fim?: string;
  promocao_duracao_dias?: number;
  promocao_status?: string;
  novidade: boolean;
  descricao?: string;
  subcategoria_id: number;
  tipo_tinta: boolean;
  cor_rgb?: string;
  tipo_eletrico: boolean;
  voltagem?: string;
  status: string;
  ordem: number;
  created_at: string;
  updated_at: string;
  imagem_principal?: string;
  imagem_2?: string;
  imagem_3?: string;
  imagem_4?: string;
  imagem_principal_index?: number;
  subcategorias?: {
    nome: string;
    categorias?: {
      nome: string;
    };
  };
}

interface Subcategoria {
  id: number;
  nome: string;
  categorias?: {
    nome: string;
  }[];
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const produtosPorPagina = 10;

  const { ToastComponent, showSuccess, showError, showInfo } = useToast();
  const { showConfirm, ConfirmModalComponent } = useConfirmModal();
  const router = useRouter();

  // Hook para atualizar promoções expiradas
  usePromocaoUpdater(() => {
    console.log("Recarregando produtos após atualização de promoções...");
    fetchProdutos();
  });

  useEffect(() => {
    fetchProdutos();
    fetchSubcategorias();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      showInfo("Carregando Produtos", "Buscando lista de produtos...");

      const { data, error } = await supabase
        .from("produtos")
        .select(
          `
          *,
          subcategorias (
            nome,
            categorias (
              nome
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProdutos(data || []);
      showSuccess(
        "Produtos Carregados",
        `${data?.length || 0} produtos encontrados no sistema.`
      );
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      showError(
        "Erro ao Carregar",
        "Não foi possível carregar a lista de produtos."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("subcategorias")
        .select(
          `
          id,
          nome,
          categorias!inner (
            nome
          )
        `
        )
        .eq("status", "ativa")
        .order("nome");

      if (error) throw error;
      setSubcategorias(data || []);
    } catch (error) {
      console.error("Erro ao buscar subcategorias:", error);
    }
  };

  const handleDelete = async (produto: Produto) => {
    const confirmed = await showConfirm({
      title: "Excluir Produto",
      message: `Tem certeza que deseja excluir o produto "${produto.nome}"? Esta ação não pode ser desfeita.`,
      type: "delete",
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (!confirmed) {
      return;
    }

    try {
      showInfo(
        "Excluindo Produto",
        `Removendo "${produto.nome}" do sistema...`
      );

      const { error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", produto.id);

      if (error) throw error;

      showSuccess(
        "Produto Excluído",
        `"${produto.nome}" foi removido com sucesso.`
      );

      fetchProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      showError(
        "Erro na Exclusão",
        `Não foi possível excluir "${produto.nome}". Tente novamente.`
      );
    }
  };

  const handleDuplicate = async (produto: Produto) => {
    const confirmed = await showConfirm({
      title: "Duplicar Produto",
      message: `Tem certeza que deseja duplicar o produto "${produto.nome}"? Uma cópia completa será criada com todas as imagens.`,
      type: "duplicate",
      confirmText: "Duplicar",
      cancelText: "Cancelar",
    });

    if (!confirmed) {
      return;
    }

    try {
      showInfo("Duplicando Produto", `Criando cópia de "${produto.nome}"...`);

      // Verificar autenticação
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não está autenticado. Faça login novamente.");
      }

      // Gerar nome único para o produto duplicado
      const novoNome = `${produto.nome} - Cópia`;
      let nomeUnico = novoNome;
      let contador = 1;

      // Verificar se já existe produto com esse nome
      while (true) {
        const { data: existente } = await supabase
          .from("produtos")
          .select("id")
          .eq("nome", nomeUnico)
          .single();

        if (!existente) break;

        contador++;
        nomeUnico = `${novoNome} ${contador}`;
      }

      // Duplicar imagens se existirem
      const imagensDuplicadas = ["", "", "", ""];
      const imagensOriginais = [
        produto.imagem_principal,
        produto.imagem_2,
        produto.imagem_3,
        produto.imagem_4,
      ];

      for (let i = 0; i < imagensOriginais.length; i++) {
        const imagemUrl = imagensOriginais[i];
        if (imagemUrl && imagemUrl.includes("supabase")) {
          try {
            // Baixar imagem original
            const response = await fetch(imagemUrl);
            if (response.ok) {
              const blob = await response.blob();

              // Gerar novo nome para a imagem
              const timestamp = Date.now();
              const randomId = Math.random().toString(36).substring(2, 8);
              const extensao =
                imagemUrl.split(".").pop()?.split("?")[0] || "jpg";
              const novoNomeImagem = `produto_${timestamp}_${randomId}.${extensao}`;
              const novoPath = `produtos/${novoNomeImagem}`;

              // Upload da nova imagem
              const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(novoPath, blob, {
                  cacheControl: "3600",
                  upsert: false,
                });

              if (!uploadError) {
                const {
                  data: { publicUrl },
                } = supabase.storage.from("images").getPublicUrl(novoPath);

                imagensDuplicadas[i] = publicUrl;
                console.log(`✅ Imagem ${i + 1} duplicada:`, publicUrl);
              } else {
                console.warn(
                  `⚠️ Erro ao duplicar imagem ${i + 1}:`,
                  uploadError
                );
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao processar imagem ${i + 1}:`, error);
          }
        }
      }

      // Criar dados do produto duplicado
      const produtoDuplicado = {
        nome: nomeUnico,
        preco: produto.preco,
        promocao_mes: false, // Resetar promoção
        preco_promocao: null,
        promocao_data_inicio: null,
        promocao_data_fim: null,
        promocao_duracao_dias: null,
        promocao_status: null,
        novidade: false, // Resetar novidade
        descricao: produto.descricao,
        subcategoria_id: produto.subcategoria_id,
        tipo_tinta: produto.tipo_tinta,
        cor_rgb: produto.cor_rgb,
        tipo_eletrico: produto.tipo_eletrico,
        voltagem: produto.voltagem,
        status: "ativo",
        ordem: produto.ordem,
        imagem_principal: imagensDuplicadas[0] || null,
        imagem_2: imagensDuplicadas[1] || null,
        imagem_3: imagensDuplicadas[2] || null,
        imagem_4: imagensDuplicadas[3] || null,
        imagem_principal_index: produto.imagem_principal_index || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📋 Dados do produto duplicado:", produtoDuplicado);

      // Inserir produto duplicado no banco
      const { data: novoProduto, error } = await supabase
        .from("produtos")
        .insert(produtoDuplicado)
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao inserir produto duplicado:", error);
        throw error;
      }

      console.log("✅ Produto duplicado criado:", novoProduto);

      showSuccess(
        "Produto Duplicado",
        `"${nomeUnico}" foi criado com sucesso! ${
          imagensDuplicadas.filter((img) => img).length
        } imagens copiadas.`
      );

      fetchProdutos();
    } catch (error) {
      console.error("❌ Erro ao duplicar produto:", error);
      showError(
        "Erro na Duplicação",
        error instanceof Error
          ? error.message
          : `Não foi possível duplicar "${produto.nome}". Tente novamente.`
      );
    }
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !filtroStatus || produto.status === filtroStatus;
    const matchSubcategoria =
      !filtroSubcategoria ||
      produto.subcategoria_id.toString() === filtroSubcategoria;

    return matchBusca && matchStatus && matchSubcategoria;
  });

  // Calcular paginação
  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const indiceInicio = (paginaAtual - 1) * produtosPorPagina;
  const indiceFim = indiceInicio + produtosPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicio, indiceFim);

  // Reset página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus, filtroSubcategoria]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (loading) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">
              Carregando produtos...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {ToastComponent}
      {ConfirmModalComponent}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Produtos
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Gerencie os produtos do sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/produtos/novo")}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-medium">Novo Produto</span>
          </button>
        </div>

        {/* Estatísticas */}
        <div className="overflow-x-auto">
          <div className="flex space-x-3 sm:space-x-6 lg:grid lg:grid-cols-4 lg:gap-6 min-w-max lg:min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex-shrink-0 w-48 sm:w-56 lg:w-auto">
              <div className="flex items-center">
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-4">
                  <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {produtos.length}
                  </p>
                  <p className="text-xs sm:text-base text-gray-600">
                    Total de Produtos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex-shrink-0 w-48 sm:w-56 lg:w-auto">
              <div className="flex items-center">
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-4">
                  <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {produtos.filter((p) => p.status === "ativo").length}
                  </p>
                  <p className="text-xs sm:text-base text-gray-600">
                    Produtos Ativos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex-shrink-0 w-48 sm:w-56 lg:w-auto">
              <div className="flex items-center">
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2 sm:mr-4">
                  <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {produtos.filter((p) => p.promocao_mes).length}
                  </p>
                  <p className="text-xs sm:text-base text-gray-600">
                    Em Promoção
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-5 flex-shrink-0 w-48 sm:w-56 lg:w-auto">
              <div className="flex items-center">
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-4">
                  <PaintBrushIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {produtos.filter((p) => p.tipo_tinta).length}
                  </p>
                  <p className="text-xs sm:text-base text-gray-600">Tintas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="overflow-x-auto">
            <div className="flex flex-col sm:flex-row lg:grid lg:grid-cols-3 gap-4 min-w-max sm:min-w-0">
              {/* Busca */}
              <div className="flex-shrink-0 w-full sm:w-80 lg:w-auto lg:col-span-1">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Nome do produto..."
                    className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 w-full sm:w-48 lg:w-auto">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full py-3 px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {/* Subcategoria */}
              <div className="flex-shrink-0 w-full sm:w-64 lg:w-auto">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Subcategoria
                </label>
                <select
                  value={filtroSubcategoria}
                  onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  className="w-full py-3 px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id} value={sub.id.toString()}>
                      {sub.nome} ({sub.categorias?.[0]?.nome})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full divide-y divide-gray-200"
              style={{ minWidth: "800px" }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ width: "80px" }}
                  >
                    Imagem
                  </th>
                  <th
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ minWidth: "200px" }}
                  >
                    Produto
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ width: "120px" }}
                  >
                    Preço
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ width: "150px" }}
                  >
                    Subcategoria
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ width: "100px" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    style={{ width: "150px" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosPaginados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-base text-gray-500"
                    >
                      {produtos.length === 0
                        ? "Nenhum produto encontrado no sistema."
                        : "Nenhum produto corresponde aos filtros aplicados."}
                    </td>
                  </tr>
                ) : (
                  produtosPaginados.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          {produto.imagem_principal ? (
                            <img
                              src={produto.imagem_principal}
                              alt={produto.nome}
                              className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <TagIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-base font-semibold text-gray-900">
                                {produto.nome}
                              </div>
                              <div className="flex gap-1">
                                {produto.promocao_mes &&
                                  produto.promocao_data_fim && (
                                    <CountdownTimer
                                      endDate={produto.promocao_data_fim}
                                      promocaoStatus={produto.promocao_status}
                                      className="inline-flex items-center"
                                    />
                                  )}
                                {produto.promocao_mes &&
                                  !produto.promocao_data_fim && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      <SparklesIcon className="h-3 w-3 mr-1" />
                                      Promoção
                                    </span>
                                  )}
                                {produto.novidade && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Novidade
                                  </span>
                                )}
                                {produto.tipo_tinta && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <PaintBrushIcon className="h-3 w-3 mr-1" />
                                    Tinta
                                  </span>
                                )}
                                {produto.tipo_eletrico && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <BoltIcon className="h-3 w-3 mr-1" />
                                    Elétrico
                                  </span>
                                )}
                              </div>
                            </div>
                            {produto.tipo_tinta && produto.cor_rgb && (
                              <div className="flex items-center mt-1">
                                <div
                                  className="w-4 h-4 rounded border border-gray-300 mr-2"
                                  style={{ backgroundColor: produto.cor_rgb }}
                                ></div>
                                <span className="text-sm text-gray-500">
                                  {produto.cor_rgb}
                                </span>
                              </div>
                            )}
                            {produto.tipo_eletrico && produto.voltagem && (
                              <div className="flex items-center mt-1">
                                <BoltIcon className="w-4 h-4 text-yellow-500 mr-2" />
                                <span className="text-sm text-gray-500">
                                  {produto.voltagem}
                                </span>
                              </div>
                            )}
                            {produto.descricao && (
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {produto.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center w-32">
                        <div className="text-base font-semibold text-gray-900">
                          {formatPrice(produto.preco)}
                        </div>
                        {produto.promocao_mes && produto.preco_promocao && (
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-orange-600 font-medium">
                              Promoção: {formatPrice(produto.preco_promocao)}
                            </div>
                            {produto.promocao_data_fim && (
                              <CountdownTimer
                                endDate={produto.promocao_data_fim}
                                promocaoStatus={produto.promocao_status}
                                className="text-xs"
                              />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center w-40">
                        <div className="text-base text-gray-900">
                          {produto.subcategorias?.nome || "N/A"}
                        </div>
                        {produto.subcategorias?.categorias?.nome && (
                          <div className="text-sm text-gray-500">
                            {produto.subcategorias.categorias.nome}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center w-24">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-base font-medium ${
                            produto.status === "ativo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {produto.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center w-40">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/produtos/${produto.id}/editar`
                              )
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                            title="Editar produto"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(produto)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200 hover:border-green-300"
                            title="Duplicar produto"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(produto)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                            title="Excluir produto"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Layout Mobile */}
        <div className="md:hidden space-y-4">
          {produtosPaginados.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-base text-gray-500">
                {produtos.length === 0
                  ? "Nenhum produto encontrado no sistema."
                  : "Nenhum produto corresponde aos filtros aplicados."}
              </p>
            </div>
          ) : (
            produtosPaginados.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                {/* Header do Card */}
                <div className="flex items-start space-x-4 mb-4">
                  {/* Imagem */}
                  <div className="flex-shrink-0">
                    {produto.imagem_principal ? (
                      <img
                        src={produto.imagem_principal}
                        alt={produto.nome}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <TagIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informações Principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {produto.nome}
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {produto.promocao_mes &&
                            produto.promocao_data_fim && (
                              <CountdownTimer
                                endDate={produto.promocao_data_fim}
                                promocaoStatus={produto.promocao_status}
                                className="inline-flex items-center"
                              />
                            )}
                          {produto.promocao_mes &&
                            !produto.promocao_data_fim && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <SparklesIcon className="h-3 w-3 mr-1" />
                                Promoção
                              </span>
                            )}
                          {produto.novidade && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Novidade
                            </span>
                          )}
                          {produto.tipo_tinta && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <PaintBrushIcon className="h-3 w-3 mr-1" />
                              Tinta
                            </span>
                          )}
                          {produto.tipo_eletrico && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <BoltIcon className="h-3 w-3 mr-1" />
                              Elétrico
                            </span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="mb-2">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                              produto.status === "ativo"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {produto.status === "ativo" ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Detalhadas */}
                <div className="space-y-3 mb-4">
                  {/* Preços */}
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(produto.preco)}
                    </div>
                    {produto.promocao_mes && produto.preco_promocao && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-lg text-orange-600 font-semibold">
                          Promoção: {formatPrice(produto.preco_promocao)}
                        </div>
                        {produto.promocao_data_fim && (
                          <CountdownTimer
                            endDate={produto.promocao_data_fim}
                            promocaoStatus={produto.promocao_status}
                            className="text-sm"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subcategoria */}
                  <div>
                    <div className="text-sm text-gray-500">Categoria:</div>
                    <div className="text-base font-medium text-gray-900">
                      {produto.subcategorias?.nome || "N/A"}
                    </div>
                    {produto.subcategorias?.categorias?.nome && (
                      <div className="text-sm text-gray-500">
                        {produto.subcategorias.categorias.nome}
                      </div>
                    )}
                  </div>

                  {/* Características Especiais */}
                  {produto.tipo_tinta && produto.cor_rgb && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Cor:</span>
                      <div
                        className="w-6 h-6 rounded border border-gray-300 mr-2"
                        style={{ backgroundColor: produto.cor_rgb }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {produto.cor_rgb}
                      </span>
                    </div>
                  )}

                  {produto.tipo_eletrico && produto.voltagem && (
                    <div className="flex items-center">
                      <BoltIcon className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-500 mr-2">
                        Voltagem:
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {produto.voltagem}
                      </span>
                    </div>
                  )}

                  {/* Descrição */}
                  {produto.descricao && (
                    <div>
                      <div className="text-sm text-gray-500">Descrição:</div>
                      <p
                        className="text-sm text-gray-700 overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {produto.descricao}
                      </p>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() =>
                        router.push(`/admin/produtos/${produto.id}/editar`)
                      }
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span className="font-medium">Editar</span>
                    </button>

                    <button
                      onClick={() => handleDuplicate(produto)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <DocumentDuplicateIcon className="h-5 w-5" />
                      <span className="font-medium">Duplicar</span>
                    </button>

                    <button
                      onClick={() => handleDelete(produto)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span className="font-medium">Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de Paginação */}
        {produtosFiltrados.length > produtosPorPagina && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Informações da página */}
              <div className="text-sm text-gray-700">
                Mostrando {indiceInicio + 1} a{" "}
                {Math.min(indiceFim, produtosFiltrados.length)} de{" "}
                {produtosFiltrados.length} produtos
              </div>

              {/* Controles de navegação */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                  disabled={paginaAtual === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Números das páginas */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter((page) => {
                      // Mostrar sempre primeira, última e páginas próximas à atual
                      return (
                        page === 1 ||
                        page === totalPaginas ||
                        (page >= paginaAtual - 1 && page <= paginaAtual + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Adicionar "..." se há gap entre páginas
                      const showEllipsis =
                        index > 0 && array[index - 1] < page - 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 py-2 text-sm text-gray-500">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setPaginaAtual(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              page === paginaAtual
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() =>
                    setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
