"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import {
  ArrowLeftIcon,
  TagIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface Subcategoria {
  id: number;
  nome: string;
  categorias?: {
    nome: string;
  }[];
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  promocao_mes: boolean;
  preco_promocao: number | null;
  promocao_duracao_dias: number | null;
  novidade: boolean;
  descricao: string | null;
  subcategoria_id: number;
  tipo_tinta: boolean;
  cor_rgb: string | null;
  tipo_eletrico: boolean;
  voltagem: string | null;
  status: string;
  imagem_principal: string | null;
  imagem_2: string | null;
  imagem_3: string | null;
  imagem_4: string | null;
  imagem_principal_index: number;
}

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const produtoId = params.id as string;
  const { ToastComponent, showSuccess, showError, showInfo } = useToast();

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [promocaoMes, setPromocaoMes] = useState(false);
  const [precoPromocao, setPrecoPromocao] = useState("");
  const [promocaoDuracaoDias, setPromocaoDuracaoDias] = useState("");
  const [novidade, setNovidade] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [tipoTinta, setTipoTinta] = useState(false);
  const [corRgb, setCorRgb] = useState("#000000");
  const [tipoEletrico, setTipoEletrico] = useState(false);
  const [voltagem, setVoltagem] = useState("");
  const [status, setStatus] = useState("ativo");

  // Estados das imagens
  const [imagens, setImagens] = useState<string[]>(["", "", "", ""]);
  const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Estados auxiliares
  const [produto, setProduto] = useState<Produto | null>(null);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduto, setLoadingProduto] = useState(true);
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (produtoId) {
      fetchProduto();
      fetchSubcategorias();
    }
  }, [produtoId]);

  const fetchProduto = async () => {
    try {
      setLoadingProduto(true);

      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("id", produtoId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Produto não encontrado");
        }
        throw error;
      }

      if (!data) {
        throw new Error("Produto não encontrado");
      }

      console.log("📦 Produto carregado:", data);

      // Preencher estados com dados do produto
      setProduto(data);
      setNome(data.nome || "");
      setPreco(data.preco?.toString() || "");
      setPromocaoMes(data.promocao_mes || false);
      setPrecoPromocao(data.preco_promocao?.toString() || "");
      setPromocaoDuracaoDias(data.promocao_duracao_dias?.toString() || "");
      setNovidade(data.novidade || false);
      setDescricao(data.descricao || "");
      setSubcategoriaId(data.subcategoria_id?.toString() || "");
      setTipoTinta(data.tipo_tinta || false);
      setCorRgb(data.cor_rgb || "#000000");
      setTipoEletrico(data.tipo_eletrico || false);
      setVoltagem(data.voltagem || "");
      setStatus(data.status || "ativo");

      // Preencher imagens
      const imagensCarregadas = [
        data.imagem_principal || "",
        data.imagem_2 || "",
        data.imagem_3 || "",
        data.imagem_4 || "",
      ];

      console.log("📷 Imagens carregadas:", {
        produtoId: data.id,
        nome: data.nome,
        imagensCarregadas,
        imagemPrincipalIndex: data.imagem_principal_index || 0,
      });

      setImagens(imagensCarregadas);
      setImagemPrincipalIndex(data.imagem_principal_index || 0);
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      showError(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o produto."
      );
      setTimeout(() => {
        router.push("/admin/produtos");
      }, 2000);
    } finally {
      setLoadingProduto(false);
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
          categorias (
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
      showError("Erro", "Não foi possível carregar as subcategorias.");
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file, index);
    event.target.value = "";
  };

  const uploadFile = async (file: File, index: number) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showError(
        "Erro",
        "Tipo de arquivo não suportado. Use PNG, JPG, JPEG ou WebP."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Erro", "Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    setUploadingIndex(index);

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `produto_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      console.log("🔄 Iniciando upload:", {
        fileName,
        filePath,
        fileSize: file.size,
      });

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      console.log("✅ Upload concluído:", {
        publicUrl,
        index,
        filePath,
        urlValida: publicUrl.startsWith("http"),
      });

      // Testar se a URL é acessível
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        console.log("🌐 Teste de acesso à URL:", {
          url: publicUrl,
          status: response.status,
          ok: response.ok,
        });
      } catch (fetchError) {
        console.warn("⚠️ Erro ao testar URL:", fetchError);
      }

      const newImages = [...imagens];
      newImages[index] = publicUrl;

      if (imagens.every((img) => !img)) {
        setImagemPrincipalIndex(index);
      }

      setImagens(newImages);
      showSuccess("Sucesso", `Imagem ${index + 1} enviada com sucesso!`);
    } catch (err) {
      console.error("❌ Erro no upload:", err);
      showError(
        "Erro",
        err instanceof Error ? err.message : "Erro no upload da imagem"
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = imagens[index];

    if (imageUrl && imageUrl.includes("supabase")) {
      try {
        const urlParts = imageUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `produtos/${fileName}`;
        await supabase.storage.from("images").remove([filePath]);
        console.log("🗑️ Arquivo removido do storage:", filePath);
      } catch (error) {
        console.warn("⚠️ Não foi possível remover arquivo do storage:", error);
      }
    }

    const newImages = [...imagens];
    newImages[index] = "";

    if (index === imagemPrincipalIndex) {
      const newPrincipalIndex = newImages.findIndex((img) => img !== "");
      setImagemPrincipalIndex(newPrincipalIndex === -1 ? 0 : newPrincipalIndex);
    }

    setImagens(newImages);
  };

  const setAsPrincipal = (index: number) => {
    if (imagens[index]) {
      setImagemPrincipalIndex(index);
      showSuccess("Sucesso", `Imagem ${index + 1} definida como principal!`);
    }
  };

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    if (!nome.trim()) {
      novosErros.nome = "Nome do produto é obrigatório";
    }

    if (!preco || parseFloat(preco) <= 0) {
      novosErros.preco = "Preço deve ser maior que zero";
    }

    if (promocaoMes && (!precoPromocao || parseFloat(precoPromocao) <= 0)) {
      novosErros.precoPromocao =
        "Preço promocional é obrigatório quando em promoção";
    }

    if (
      promocaoMes &&
      precoPromocao &&
      preco &&
      parseFloat(precoPromocao) >= parseFloat(preco)
    ) {
      novosErros.precoPromocao =
        "Preço promocional deve ser menor que o preço normal";
    }

    if (
      promocaoMes &&
      (!promocaoDuracaoDias || parseInt(promocaoDuracaoDias) <= 0)
    ) {
      novosErros.promocaoDuracaoDias =
        "Duração da promoção em dias é obrigatória";
    }

    if (
      promocaoMes &&
      promocaoDuracaoDias &&
      parseInt(promocaoDuracaoDias) > 365
    ) {
      novosErros.promocaoDuracaoDias = "Duração máxima da promoção é 365 dias";
    }

    if (!subcategoriaId) {
      novosErros.subcategoriaId = "Selecione uma subcategoria";
    }

    if (tipoEletrico && !voltagem.trim()) {
      novosErros.voltagem = "Voltagem é obrigatória para produtos elétricos";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const verificarAlteracoes = () => {
    if (!produto) return false;

    const imagensOriginais = [
      produto.imagem_principal || "",
      produto.imagem_2 || "",
      produto.imagem_3 || "",
      produto.imagem_4 || "",
    ];

    const imagensIguais =
      JSON.stringify(imagensOriginais) === JSON.stringify(imagens);
    const indexIgual =
      (produto.imagem_principal_index || 0) === imagemPrincipalIndex;

    console.log("🔍 Verificando alterações:", {
      imagensOriginais,
      imagensAtuais: imagens,
      imagensIguais,
      indexOriginal: produto.imagem_principal_index || 0,
      indexAtual: imagemPrincipalIndex,
      indexIgual,
    });

    const houveMudanca =
      nome !== produto.nome ||
      parseFloat(preco) !== produto.preco ||
      promocaoMes !== produto.promocao_mes ||
      (promocaoMes ? parseFloat(precoPromocao) : null) !==
        produto.preco_promocao ||
      (promocaoMes ? parseInt(promocaoDuracaoDias) : null) !==
        produto.promocao_duracao_dias ||
      novidade !== produto.novidade ||
      descricao !== (produto.descricao || "") ||
      parseInt(subcategoriaId) !== produto.subcategoria_id ||
      tipoTinta !== produto.tipo_tinta ||
      (tipoTinta ? corRgb : null) !== produto.cor_rgb ||
      tipoEletrico !== produto.tipo_eletrico ||
      (tipoEletrico ? voltagem : null) !== produto.voltagem ||
      status !== produto.status ||
      !imagensIguais ||
      !indexIgual;

    return houveMudanca;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      showError(
        "Formulário Inválido",
        "Corrija os erros indicados antes de continuar."
      );
      return;
    }

    if (!verificarAlteracoes()) {
      showInfo("Sem Alterações", "Nenhuma alteração foi detectada.");
      return;
    }

    setLoading(true);

    try {
      showInfo("Atualizando Produto", "Salvando alterações...");

      // Verificar autenticação antes de tentar atualizar
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log("🔐 Verificando autenticação antes da atualização:", {
        user: user?.email,
        authError,
        isAuthenticated: !!user,
      });

      if (!user) {
        throw new Error("Usuário não está autenticado. Faça login novamente.");
      }

      const dataInicio = promocaoMes ? new Date() : null;
      const dataFim =
        promocaoMes && promocaoDuracaoDias
          ? new Date(
              Date.now() + parseInt(promocaoDuracaoDias) * 24 * 60 * 60 * 1000
            )
          : null;

      const produtoData = {
        nome: nome.trim(),
        preco: parseFloat(preco),
        promocao_mes: promocaoMes,
        preco_promocao: promocaoMes ? parseFloat(precoPromocao) : null,
        promocao_data_inicio: dataInicio
          ? dataInicio.toISOString().split("T")[0]
          : null,
        promocao_data_fim: dataFim ? dataFim.toISOString().split("T")[0] : null,
        promocao_duracao_dias: promocaoMes
          ? parseInt(promocaoDuracaoDias)
          : null,
        promocao_status: promocaoMes ? "ativa" : null,
        novidade: novidade,
        descricao: descricao.trim() || null,
        subcategoria_id: parseInt(subcategoriaId),
        tipo_tinta: tipoTinta,
        cor_rgb: tipoTinta ? corRgb : null,
        tipo_eletrico: tipoEletrico,
        voltagem: tipoEletrico ? voltagem.trim() : null,
        status: status,
        imagem_principal: imagens[0] || null,
        imagem_2: imagens[1] || null,
        imagem_3: imagens[2] || null,
        imagem_4: imagens[3] || null,
        imagem_principal_index: imagemPrincipalIndex,
        updated_at: new Date().toISOString(),
      };

      console.log("💾 Dados que serão atualizados:", produtoData);

      const { data: updatedData, error } = await supabase
        .from("produtos")
        .update(produtoData)
        .eq("id", produtoId)
        .select();

      console.log("📊 Resposta da atualização:", { updatedData, error });

      if (error) {
        console.error("❌ Erro detalhado:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        if (error.code === "23505") {
          throw new Error("Já existe um produto com este nome");
        }
        if (
          error.code === "42501" ||
          error.message?.includes("permission denied")
        ) {
          throw new Error(
            "Erro de permissão. Verifique se você está logado como administrador."
          );
        }
        throw error;
      }

      showSuccess(
        "Produto Atualizado",
        `"${nome}" foi atualizado com sucesso! Redirecionando...`
      );

      setTimeout(() => {
        router.push("/admin/produtos");
      }, 1500);
    } catch (error) {
      console.error("❌ Erro ao atualizar produto:", error);
      showError(
        "Erro ao Atualizar",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o produto."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/produtos");
  };

  const getImageCount = () => {
    return imagens.filter((img) => img !== "").length;
  };

  if (loadingProduto) {
    return (
      <>
        {ToastComponent}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Carregando Produto
              </h2>
              <p className="text-gray-600">
                Aguarde enquanto carregamos os dados...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!produto) {
    return (
      <>
        {ToastComponent}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Produto não encontrado
              </h2>
              <p className="text-gray-600 mb-4">
                O produto solicitado não foi encontrado.
              </p>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar para Produtos
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Produto
              </h1>
              <p className="text-gray-600 text-lg">
                Editando: <span className="font-medium">{produto.nome}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    erros.nome ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Digite o nome do produto"
                />
                {erros.nome && (
                  <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
                )}
              </div>

              {/* Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      erros.preco ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0,00"
                  />
                </div>
                {erros.preco && (
                  <p className="mt-1 text-sm text-red-600">{erros.preco}</p>
                )}
              </div>

              {/* Subcategoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategoria *
                </label>
                <select
                  value={subcategoriaId}
                  onChange={(e) => setSubcategoriaId(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    erros.subcategoriaId ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma subcategoria</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id} value={sub.id.toString()}>
                      {sub.nome} ({sub.categorias?.[0]?.nome})
                    </option>
                  ))}
                </select>
                {erros.subcategoriaId && (
                  <p className="mt-1 text-sm text-red-600">
                    {erros.subcategoriaId}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descrição detalhada do produto (opcional)"
                />
              </div>
            </div>
          </div>

          {/* Promoção */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Promoção</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="promocaoMes"
                  checked={promocaoMes}
                  onChange={(e) => setPromocaoMes(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="promocaoMes"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Produto em promoção
                </label>
              </div>

              {promocaoMes && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Promocional *
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={precoPromocao}
                        onChange={(e) => setPrecoPromocao(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          erros.precoPromocao
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="0,00"
                      />
                    </div>
                    {erros.precoPromocao && (
                      <p className="mt-1 text-sm text-red-600">
                        {erros.precoPromocao}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (dias) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={promocaoDuracaoDias}
                      onChange={(e) => setPromocaoDuracaoDias(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        erros.promocaoDuracaoDias
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="30"
                    />
                    {erros.promocaoDuracaoDias && (
                      <p className="mt-1 text-sm text-red-600">
                        {erros.promocaoDuracaoDias}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Características */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Características
            </h2>

            <div className="space-y-4">
              {/* Novidade */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="novidade"
                  checked={novidade}
                  onChange={(e) => setNovidade(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="novidade"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Produto novidade
                </label>
              </div>

              {/* Tipo Tinta */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tipoTinta"
                    checked={tipoTinta}
                    onChange={(e) => setTipoTinta(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="tipoTinta"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    É um produto de tinta
                  </label>
                </div>

                {tipoTinta && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor (RGB)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={corRgb}
                        onChange={(e) => setCorRgb(e.target.value)}
                        className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={corRgb}
                        onChange={(e) => setCorRgb(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo Elétrico */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tipoEletrico"
                    checked={tipoEletrico}
                    onChange={(e) => setTipoEletrico(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="tipoEletrico"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    É um produto elétrico
                  </label>
                </div>

                {tipoEletrico && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voltagem *
                    </label>
                    <select
                      value={voltagem}
                      onChange={(e) => setVoltagem(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        erros.voltagem ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Selecione a voltagem</option>
                      <option value="110V">110V</option>
                      <option value="220V">220V</option>
                      <option value="Bivolt">Bivolt (110V/220V)</option>
                      <option value="12V">12V</option>
                      <option value="24V">24V</option>
                    </select>
                    {erros.voltagem && (
                      <p className="mt-1 text-sm text-red-600">
                        {erros.voltagem}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galeria de Imagens */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Galeria de Imagens
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getImageCount()}/4 imagens adicionadas
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>Clique para adicionar</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {imagens.map((image, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Imagem {index + 1}
                      {index === imagemPrincipalIndex && image && (
                        <StarIcon className="inline h-4 w-4 text-yellow-500 ml-1" />
                      )}
                    </label>
                    {index === imagemPrincipalIndex && image && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Principal
                      </span>
                    )}
                  </div>

                  {!image ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, index)}
                        disabled={uploadingIndex === index}
                        className="hidden"
                        id={`image-input-${index}`}
                      />
                      <label
                        htmlFor={`image-input-${index}`}
                        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                      >
                        <div className="text-center">
                          {uploadingIndex === index ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-blue-600 font-medium">
                                Enviando...
                              </p>
                              <p className="text-xs text-gray-500">Aguarde</p>
                            </>
                          ) : (
                            <>
                              <PhotoIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 font-medium">
                                Clique para adicionar
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, WebP até 5MB
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden group border border-gray-200">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onLoad={() => {
                            console.log(
                              `✅ Imagem ${index + 1} carregada:`,
                              image.substring(0, 50) + "..."
                            );
                          }}
                          onError={() => {
                            console.error(
                              `❌ Erro ao carregar imagem ${index + 1}:`,
                              image
                            );
                            console.log(
                              "🔍 URL completa da imagem com erro:",
                              image
                            );
                          }}
                        />

                        {/* Overlay apenas no hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                              title="Remover imagem"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                            {index !== imagemPrincipalIndex && (
                              <button
                                type="button"
                                onClick={() => setAsPrincipal(index)}
                                className="p-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-colors"
                                title="Definir como principal"
                              >
                                <StarIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Badge de imagem principal */}
                        {index === imagemPrincipalIndex && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white shadow-sm">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Principal
                            </span>
                          </div>
                        )}

                        {/* Debug: Mostrar parte da URL */}
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {image.split("/").pop()?.substring(0, 10)}...
                        </div>
                      </div>

                      {index !== imagemPrincipalIndex && (
                        <button
                          type="button"
                          onClick={() => setAsPrincipal(index)}
                          className="w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800 border border-gray-200 hover:border-yellow-300"
                        >
                          <StarIcon className="h-3 w-3 inline mr-1" />
                          Definir como Principal
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <PhotoIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Dicas para Upload de Imagens
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Use imagens de alta qualidade (recomendado: 800x800px)
                      </li>
                      <li>Formatos aceitos: PNG, JPG, JPEG, WebP</li>
                      <li>Tamanho máximo: 5MB por imagem</li>
                      <li>A imagem principal aparece nos carrosséis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !verificarAlteracoes()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <TagIcon className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
