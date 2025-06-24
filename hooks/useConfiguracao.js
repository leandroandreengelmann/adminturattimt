import { useState, useEffect } from "react";

/**
 * Hook para buscar configuração específica por identificador
 * @param {string} identificador - ID único da configuração
 * @returns {object} { config, loading, error }
 */
export function useConfiguracao(identificador) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identificador) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/configuracoes?id=${identificador}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Configuração "${identificador}" não encontrada`);
          }
          throw new Error("Erro ao buscar configuração");
        }

        const data = await response.json();
        setConfig(data.configuracao);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar configuração:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [identificador]);

  return { config, loading, error };
}

/**
 * Hook para buscar múltiplas configurações
 * @param {string} categoria - Categoria das configurações (opcional)
 * @returns {object} { configuracoes, loading, error }
 */
export function useConfiguracoes(categoria = null) {
  const [configuracoes, setConfiguracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfiguracoes = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = categoria
          ? `/api/configuracoes?categoria=${categoria}`
          : "/api/configuracoes";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Erro ao buscar configurações");
        }

        const data = await response.json();
        setConfiguracoes(data.configuracoes || []);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar configurações:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguracoes();
  }, [categoria]);

  return { configuracoes, loading, error };
}

/**
 * Hook para buscar configuração específica com fallback
 * @param {string} identificador - ID único da configuração
 * @param {string} fallbackTexto - Texto padrão se não encontrar
 * @param {string} fallbackDescricao - Descrição padrão se não encontrar
 * @returns {object} { texto, descricao, loading, error }
 */
export function useConfiguracaoComFallback(
  identificador,
  fallbackTexto = "",
  fallbackDescricao = ""
) {
  const { config, loading, error } = useConfiguracao(identificador);

  const texto = config?.texto || fallbackTexto;
  const descricao = config?.descricao || fallbackDescricao;

  return { texto, descricao, loading, error, config };
}
