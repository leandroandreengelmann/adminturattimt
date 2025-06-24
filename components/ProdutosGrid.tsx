"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TagIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  promocao_mes: boolean;
  preco_promocao: number | null;
  promocao_data_inicio: string | null;
  promocao_data_fim: string | null;
  novidade: boolean;
  descricao: string | null;
  subcategoria_id: number;
  tipo_tinta: boolean;
  cor_rgb: string | null;
  tipo_eletrico: boolean;
  voltagem: string | null;
  ordem: number;
  imagem_principal: string | null;
  imagem_2: string | null;
  imagem_3: string | null;
  imagem_4: string | null;
  imagem_principal_index: number;
  subcategoria: {
    id: number;
    nome: string;
    categorias: {
      id: number;
      nome: string;
    } | null;
  } | null;
  preco_formatado: string;
  preco_promocao_formatado: string | null;
}

interface ProdutosGridProps {
  categoria?: string;
  subcategoria?: string;
  promocao?: boolean;
  novidade?: boolean;
  titulo?: string;
  className?: string;
}

export default function ProdutosGrid({
  categoria,
  subcategoria,
  promocao = false,
  novidade = false,
  titulo = "Nossos Produtos",
  className = "",
}: ProdutosGridProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProdutos();
  }, [categoria, subcategoria, promocao, novidade]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Sempre limitar a 6 produtos para mostrar 5.5
      params.append("limite", "6");

      if (categoria) params.append("categoria", categoria);
      if (subcategoria) params.append("subcategoria_id", subcategoria);
      if (promocao) params.append("promocao", "true");
      if (novidade) params.append("novidade", "true");

      const response = await fetch(`/api/produtos?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar produtos");
      }

      const data = await response.json();
      setProdutos(data.produtos || []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Erro ao carregar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getImagemProduto = (produto: Produto) => {
    // Determinar qual imagem mostrar baseado no índice principal
    const imagens = [
      produto.imagem_principal,
      produto.imagem_2,
      produto.imagem_3,
      produto.imagem_4,
    ];

    const imagemPrincipal =
      imagens[produto.imagem_principal_index] || produto.imagem_principal;
    return imagemPrincipal;
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{titulo}</h2>
        <div className="grid grid-cols-6 gap-4">
          {/* 5 produtos completos */}
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
          {/* Metade do 6º produto */}
          <div className="animate-pulse overflow-hidden w-1/2">
            <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{titulo}</h2>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <TagIcon className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchProdutos}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{titulo}</h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <TagIcon className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">Nenhum produto encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{titulo}</h2>

      <div className="grid grid-cols-6 gap-4">
        {/* Primeiros 5 produtos completos */}
        {produtos.slice(0, 5).map((produto) => (
          <div
            key={produto.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
          >
            {/* Imagem do Produto */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {getImagemProduto(produto) ? (
                <Image
                  src={getImagemProduto(produto)!}
                  alt={produto.nome}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TagIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {produto.promocao_mes && (
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
              </div>
            </div>

            {/* Informações do Produto */}
            <div className="p-4">
              <h3
                className="font-semibold text-gray-900 mb-2 text-sm overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                }}
              >
                {produto.nome}
              </h3>

              {/* Categoria */}
              {produto.subcategoria && (
                <p className="text-xs text-gray-500 mb-2">
                  {produto.subcategoria.nome}
                </p>
              )}

              {/* Preços */}
              <div className="space-y-1">
                {produto.promocao_mes && produto.preco_promocao_formatado ? (
                  <>
                    <div className="text-lg font-bold text-blue-600">
                      {produto.preco_promocao_formatado}
                    </div>
                    <div className="text-sm text-gray-500 line-through">
                      {produto.preco_formatado}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-bold text-blue-600">
                    {produto.preco_formatado}
                  </div>
                )}
              </div>

              {/* Características especiais */}
              <div className="mt-2 flex flex-wrap gap-1">
                {produto.tipo_tinta && produto.cor_rgb && (
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300 mr-1"
                      style={{ backgroundColor: produto.cor_rgb }}
                    ></div>
                    <span className="text-xs text-gray-500">Tinta</span>
                  </div>
                )}
                {produto.tipo_eletrico && produto.voltagem && (
                  <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                    {produto.voltagem}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 6º produto pela metade */}
        {produtos[5] && (
          <div className="overflow-hidden w-1/2 relative">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              {/* Imagem do Produto */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {getImagemProduto(produtos[5]) ? (
                  <Image
                    src={getImagemProduto(produtos[5])!}
                    alt={produtos[5].nome}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 25vw, 10vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TagIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {produtos[5].promocao_mes && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Promoção
                    </span>
                  )}
                  {produtos[5].novidade && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Novidade
                    </span>
                  )}
                </div>
              </div>

              {/* Informações do Produto */}
              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 mb-2 text-sm overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }}
                >
                  {produtos[5].nome}
                </h3>

                {/* Categoria */}
                {produtos[5].subcategoria && (
                  <p className="text-xs text-gray-500 mb-2">
                    {produtos[5].subcategoria.nome}
                  </p>
                )}

                {/* Preços */}
                <div className="space-y-1">
                  {produtos[5].promocao_mes &&
                  produtos[5].preco_promocao_formatado ? (
                    <>
                      <div className="text-lg font-bold text-blue-600">
                        {produtos[5].preco_promocao_formatado}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {produtos[5].preco_formatado}
                      </div>
                    </>
                  ) : (
                    <div className="text-lg font-bold text-blue-600">
                      {produtos[5].preco_formatado}
                    </div>
                  )}
                </div>

                {/* Características especiais */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {produtos[5].tipo_tinta && produtos[5].cor_rgb && (
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300 mr-1"
                        style={{ backgroundColor: produtos[5].cor_rgb }}
                      ></div>
                      <span className="text-xs text-gray-500">Tinta</span>
                    </div>
                  )}
                  {produtos[5].tipo_eletrico && produtos[5].voltagem && (
                    <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                      {produtos[5].voltagem}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Efeito de corte - gradiente do lado direito */}
            <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-white via-white to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>

      {/* Botão para ver mais (se houver mais produtos) */}
      {produtos.length > 5 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Ver Todos os Produtos
          </button>
        </div>
      )}
    </div>
  );
}
