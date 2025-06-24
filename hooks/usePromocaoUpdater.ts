import { useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export const usePromocaoUpdater = (onUpdate?: () => void) => {
  const updateExpiredPromocoes = useCallback(async () => {
    try {
      console.log("Verificando promoções expiradas...");

      // Buscar produtos com promoções ativas que podem ter expirado
      const { data: produtos, error } = await supabase
        .from("produtos")
        .select("id, nome, promocao_data_fim, promocao_status")
        .eq("promocao_mes", true)
        .eq("promocao_status", "ativa")
        .not("promocao_data_fim", "is", null);

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        return;
      }

      if (!produtos || produtos.length === 0) {
        return;
      }

      const agora = new Date();
      const produtosExpirados = produtos.filter((produto) => {
        const dataFim = new Date(produto.promocao_data_fim!);
        return dataFim < agora;
      });

      if (produtosExpirados.length === 0) {
        return;
      }

      // Atualizar produtos expirados
      const { error: updateError } = await supabase
        .from("produtos")
        .update({
          promocao_status: "expirada",
          updated_at: new Date().toISOString(),
        })
        .in(
          "id",
          produtosExpirados.map((p) => p.id)
        );

      if (updateError) {
        console.error("Erro ao atualizar produtos:", updateError);
        return;
      }

      console.log(
        `${produtosExpirados.length} promoções marcadas como expiradas`
      );

      // Chamar callback se fornecido
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Erro na verificação de promoções:", error);
    }
  }, [onUpdate]);

  const callEdgeFunction = useCallback(async () => {
    try {
      const response = await fetch("/api/update-promocoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Edge function executada:", result);

        if (result.updated > 0 && onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Erro ao chamar edge function:", error);
      // Fallback para verificação local
      await updateExpiredPromocoes();
    }
  }, [updateExpiredPromocoes, onUpdate]);

  useEffect(() => {
    // Verificar imediatamente quando o hook é montado
    updateExpiredPromocoes();

    // Configurar intervalo para verificar a cada 1 minuto
    const interval = setInterval(updateExpiredPromocoes, 60000);

    return () => clearInterval(interval);
  }, [updateExpiredPromocoes]);

  return {
    updateExpiredPromocoes,
    callEdgeFunction,
  };
};
