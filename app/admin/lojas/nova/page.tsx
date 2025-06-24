"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import {
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function NovaLojaPage() {
  const router = useRouter();

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [telefones, setTelefones] = useState<string[]>([""]);
  const [endereco, setEndereco] = useState("");
  const [horarioFuncionamento, setHorarioFuncionamento] = useState("");

  // Estados da galeria
  const [imagens, setImagens] = useState<string[]>(new Array(10).fill(""));
  const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const { ToastComponent, showSuccess, showError, showInfo } = useToast();

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

    setLoading(true);

    try {
      showInfo("Criando", "Salvando informações da loja...");

      // Buscar a próxima ordem
      const { data: lojasExistentes } = await supabase
        .from("lojas")
        .select("ordem")
        .order("ordem", { ascending: false })
        .limit(1);

      const proximaOrdem = lojasExistentes?.[0]?.ordem
        ? lojasExistentes[0].ordem + 1
        : 1;

      // Preparar telefones válidos
      const telefonesValidos = telefones
        .filter((tel) => tel.trim() !== "")
        .map((tel) => tel.replace(/\D/g, "")); // Salva apenas números

      const lojaData = {
        nome: nome.trim(),
        telefones: telefonesValidos,
        endereco: endereco.trim(),
        horario_funcionamento: horarioFuncionamento.trim(),
        status: "ativa",
        ordem: proximaOrdem,
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
        .insert([lojaData])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma loja com este nome");
        }
        throw error;
      }

      showSuccess(
        "Loja Criada",
        `"${nome}" foi criada com sucesso! Redirecionando...`
      );

      setTimeout(() => {
        router.push("/admin/lojas");
      }, 1500);
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      showError(
        "Erro ao Criar",
        error instanceof Error
          ? error.message
          : "Não foi possível criar a loja. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      nome ||
      telefones.some((tel) => tel.trim() !== "") ||
      endereco ||
      horarioFuncionamento ||
      imagens.some((img) => img.trim() !== "");

    if (hasChanges) {
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

  return (
    <>
      {ToastComponent}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Loja</h1>
            <p className="text-gray-600 text-lg">
              Preencha as informações da loja
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar
          </button>
        </div>

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
              disabled={loading}
              className="flex-1 px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Criando..." : "Criar Loja"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
