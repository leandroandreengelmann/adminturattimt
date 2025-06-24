"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import {
  ArrowLeftIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
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

export default function EditarLojaPage() {
  const router = useRouter();
  const params = useParams();
  const lojaId = params?.id as string;

  // Estados de dados
  const [loja, setLoja] = useState<Loja | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [telefones, setTelefones] = useState<string[]>([""]);
  const [endereco, setEndereco] = useState("");
  const [horarioFuncionamento, setHorarioFuncionamento] = useState("");
  const [status, setStatus] = useState("ativa");

  // Estados da galeria
  const [imagens, setImagens] = useState<string[]>(new Array(10).fill(""));
  const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  const { ToastComponent, showSuccess, showError, showInfo, showWarning } =
    useToast();

  useEffect(() => {
    fetchLoja();
  }, [lojaId]);

  useEffect(() => {
    if (loja) {
      verificarAlteracoes();
    }
  }, [
    nome,
    telefones,
    endereco,
    horarioFuncionamento,
    status,
    imagens,
    imagemPrincipalIndex,
    loja,
  ]);

  const fetchLoja = async () => {
    try {
      setLoadingInitial(true);
      showInfo("Carregando", "Buscando informações da loja...");

      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("id", lojaId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("Loja não encontrada");
        }
        throw error;
      }

      setLoja(data);

      // Preencher formulário
      setNome(data.nome);

      // Preencher telefones
      if (data.telefones && data.telefones.length > 0) {
        setTelefones(data.telefones.map((tel: string) => formatTelefone(tel)));
      } else {
        setTelefones([""]);
      }

      setEndereco(data.endereco);
      setHorarioFuncionamento(data.horario_funcionamento);
      setStatus(data.status);

      // Preencher galeria
      const imagensLoja = [
        data.imagem_principal || "",
        data.imagem_2 || "",
        data.imagem_3 || "",
        data.imagem_4 || "",
        data.imagem_5 || "",
        data.imagem_6 || "",
        data.imagem_7 || "",
        data.imagem_8 || "",
        data.imagem_9 || "",
        data.imagem_10 || "",
      ];
      setImagens(imagensLoja);
      setImagemPrincipalIndex(data.imagem_principal_index || 0);

      showSuccess("Loja Carregada", `Editando "${data.nome}".`);
    } catch (error) {
      console.error("Erro ao buscar loja:", error);
      showError(
        "Erro ao Carregar",
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a loja."
      );
      setTimeout(() => router.push("/admin/lojas"), 2000);
    } finally {
      setLoadingInitial(false);
    }
  };

  const verificarAlteracoes = () => {
    if (!loja) return;

    // Verificar telefones
    const telefonesOriginais = loja.telefones || [];
    const telefonesAtuais = telefones
      .filter((tel) => tel.trim() !== "")
      .map((tel) => tel.replace(/\D/g, ""));
    const telefonesMudaram =
      telefonesOriginais.length !== telefonesAtuais.length ||
      telefonesOriginais.some((tel, index) => tel !== telefonesAtuais[index]);

    // Verificar imagens
    const imagensOriginais = [
      loja.imagem_principal || "",
      loja.imagem_2 || "",
      loja.imagem_3 || "",
      loja.imagem_4 || "",
      loja.imagem_5 || "",
      loja.imagem_6 || "",
      loja.imagem_7 || "",
      loja.imagem_8 || "",
      loja.imagem_9 || "",
      loja.imagem_10 || "",
    ];
    const imagensMudaram =
      imagens.some((img, index) => img !== imagensOriginais[index]) ||
      imagemPrincipalIndex !== (loja.imagem_principal_index || 0);

    const houveMudanca =
      nome !== loja.nome ||
      telefonesMudaram ||
      endereco !== loja.endereco ||
      horarioFuncionamento !== loja.horario_funcionamento ||
      status !== loja.status ||
      imagensMudaram;

    setTemAlteracoes(houveMudanca);
  };

  const formatTelefone = (valor: string) => {
    // Remove todos os caracteres não numéricos
    const apenasNumeros = valor.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limitado = apenasNumeros.slice(0, 11);

    // Aplica máscara baseada no tamanho
    if (limitado.length <= 10) {
      return limitado
        .replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        .replace(/-$/, "");
    } else {
      return limitado
        .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        .replace(/-$/, "");
    }
  };

  const adicionarTelefone = () => {
    if (telefones.length < 5) {
      setTelefones([...telefones, ""]);
    }
  };

  const removerTelefone = (index: number) => {
    if (telefones.length > 1) {
      const novosTelefones = telefones.filter((_, i) => i !== index);
      setTelefones(novosTelefones);
    }
  };

  const atualizarTelefone = (index: number, valor: string) => {
    const novosTelefones = [...telefones];
    novosTelefones[index] = formatTelefone(valor);
    setTelefones(novosTelefones);
  };

  const atualizarImagem = (index: number, url: string) => {
    const novasImagens = [...imagens];
    novasImagens[index] = url;
    setImagens(novasImagens);
  };

  const definirImagemPrincipal = (index: number) => {
    if (imagens[index] && imagens[index].trim() !== "") {
      setImagemPrincipalIndex(index);
    }
  };

  const validarFormulario = () => {
    const novosErros: { [key: string]: string } = {};

    if (!nome.trim()) {
      novosErros.nome = "Nome da loja é obrigatório";
    }

    // Validar telefones
    const telefonesValidos = telefones.filter((tel) => tel.trim() !== "");
    if (telefonesValidos.length === 0) {
      novosErros.telefones = "Pelo menos um telefone é obrigatório";
    } else {
      let telefoneInvalido = false;
      telefonesValidos.forEach((telefone, index) => {
        const apenasNumeros = telefone.replace(/\D/g, "");
        if (apenasNumeros.length < 10) {
          novosErros[`telefone_${index}`] =
            "Telefone deve ter pelo menos 10 dígitos";
          telefoneInvalido = true;
        }
      });
      if (telefoneInvalido) {
        novosErros.telefones = "Verifique os telefones informados";
      }
    }

    if (!endereco.trim()) {
      novosErros.endereco = "Endereço é obrigatório";
    }

    if (!horarioFuncionamento.trim()) {
      novosErros.horarioFuncionamento =
        "Horário de funcionamento é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
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

    if (!temAlteracoes) {
      showWarning("Sem Alterações", "Não há alterações para salvar.");
      return;
    }

    setLoading(true);

    try {
      showInfo("Atualizando", "Salvando alterações da loja...");

      // Preparar telefones válidos
      const telefonesValidos = telefones
        .filter((tel) => tel.trim() !== "")
        .map((tel) => tel.replace(/\D/g, "")); // Salva apenas números

      const lojaData = {
        nome: nome.trim(),
        telefones: telefonesValidos,
        endereco: endereco.trim(),
        horario_funcionamento: horarioFuncionamento.trim(),
        status: status,
        imagem_principal: imagens[0] || null,
        imagem_2: imagens[1] || null,
        imagem_3: imagens[2] || null,
        imagem_4: imagens[3] || null,
        imagem_5: imagens[4] || null,
        imagem_6: imagens[5] || null,
        imagem_7: imagens[6] || null,
        imagem_8: imagens[7] || null,
        imagem_9: imagens[8] || null,
        imagem_10: imagens[9] || null,
        imagem_principal_index: imagemPrincipalIndex,
      };

      const { error } = await supabase
        .from("lojas")
        .update(lojaData)
        .eq("id", lojaId);

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma loja com este nome");
        }
        throw error;
      }

      showSuccess(
        "Loja Atualizada",
        `"${nome}" foi atualizada com sucesso! Redirecionando...`
      );

      setTimeout(() => {
        router.push("/admin/lojas");
      }, 1500);
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
      showError(
        "Erro ao Atualizar",
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a loja. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!loja) return;

    if (
      !confirm(
        `Tem certeza que deseja EXCLUIR a loja "${loja.nome}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      showInfo("Excluindo", `Removendo "${loja.nome}" do sistema...`);

      const { error } = await supabase.from("lojas").delete().eq("id", lojaId);

      if (error) throw error;

      showSuccess(
        "Loja Excluída",
        `"${loja.nome}" foi removida com sucesso! Redirecionando...`
      );

      setTimeout(() => {
        router.push("/admin/lojas");
      }, 1500);
    } catch (error) {
      console.error("Erro ao excluir loja:", error);
      showError(
        "Erro na Exclusão",
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a loja."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (temAlteracoes) {
      if (
        confirm(
          "Você tem alterações não salvas. Tem certeza que deseja cancelar?"
        )
      ) {
        router.push("/admin/lojas");
      }
    } else {
      router.push("/admin/lojas");
    }
  };

  const sugestaoHorario = `Segunda a Sexta: 7h às 17h
Sábado: 7h às 12h
Domingo: Fechado`;

  const usarExemploHorario = () => {
    setHorarioFuncionamento(sugestaoHorario);
  };

  if (loadingInitial) {
    return (
      <>
        {ToastComponent}
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-base">Carregando loja...</p>
          </div>
        </div>
      </>
    );
  }

  if (!loja) {
    return (
      <>
        {ToastComponent}
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Loja não encontrada.</p>
          <Link
            href="/admin/lojas"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar para Lojas
          </Link>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Loja</h1>
            <p className="text-gray-600 text-lg">
              Modificando informações de &ldquo;{loja.nome}&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Excluir
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>

        {/* Indicador de Alterações */}
        {temAlteracoes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-base">
              ⚠️ Você tem alterações não salvas. Lembre-se de clicar em
              &ldquo;Salvar Alterações&rdquo; antes de sair.
            </p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>
            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome da loja"
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    erros.nome ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {erros.nome && (
                  <p className="mt-2 text-sm text-red-600">{erros.nome}</p>
                )}
              </div>

              {/* Telefones */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Telefones *
                </label>
                {telefones.map((telefone, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => atualizarTelefone(index, e.target.value)}
                      placeholder={`Telefone ${index + 1}`}
                      className={`flex-1 px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        erros[`telefone_${index}`]
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {telefones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerTelefone(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover telefone"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {telefones.length < 5 && (
                  <button
                    type="button"
                    onClick={adicionarTelefone}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Adicionar outro telefone
                  </button>
                )}
                {erros.telefones && (
                  <p className="mt-2 text-sm text-red-600">{erros.telefones}</p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Endereço *
                </label>
                <textarea
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Digite o endereço completo da loja"
                  rows={3}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    erros.endereco ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {erros.endereco && (
                  <p className="mt-2 text-sm text-red-600">{erros.endereco}</p>
                )}
              </div>

              {/* Horário de Funcionamento */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-base font-medium text-gray-700">
                    Horário de Funcionamento *
                  </label>
                  <button
                    type="button"
                    onClick={usarExemploHorario}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Usar este exemplo
                  </button>
                </div>
                <textarea
                  value={horarioFuncionamento}
                  onChange={(e) => setHorarioFuncionamento(e.target.value)}
                  placeholder={sugestaoHorario}
                  rows={4}
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                    erros.horarioFuncionamento
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                />
                {erros.horarioFuncionamento && (
                  <p className="mt-2 text-sm text-red-600">
                    {erros.horarioFuncionamento}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Galeria de Imagens */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Galeria de Imagens (opcional)
            </h2>
            <p className="text-gray-600 mb-4">
              Adicione até 10 fotos da loja. Você pode definir qual será a
              imagem principal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagens.map((imagem, index) => (
                <ImageUpload
                  key={index}
                  value={imagem}
                  onChange={(url) => atualizarImagem(index, url)}
                  onSetAsPrincipal={() => definirImagemPrincipal(index)}
                  isPrincipal={index === imagemPrincipalIndex}
                  index={index}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !temAlteracoes}
              className="flex-1 px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
