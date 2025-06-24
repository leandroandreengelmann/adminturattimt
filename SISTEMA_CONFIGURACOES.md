# Sistema de Configurações - TurattiMT

## Visão Geral

Sistema completo para gerenciar textos e descrições do site através de um painel administrativo, permitindo identificar cada configuração por um ID único para uso no frontend.

## Estrutura do Banco de Dados

### Tabela: `configuracoes`

```sql
CREATE TABLE configuracoes (
  id SERIAL PRIMARY KEY,
  identificador VARCHAR(100) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  texto TEXT,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'texto',
  categoria VARCHAR(50) DEFAULT 'geral',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_configuracoes_identificador ON configuracoes(identificador);
CREATE INDEX idx_configuracoes_categoria ON configuracoes(categoria);
CREATE INDEX idx_configuracoes_ativo ON configuracoes(ativo);
CREATE INDEX idx_configuracoes_ordem ON configuracoes(ordem);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Campos da Tabela

| Campo           | Tipo         | Descrição                                                 |
| --------------- | ------------ | --------------------------------------------------------- |
| `id`            | SERIAL       | Chave primária                                            |
| `identificador` | VARCHAR(100) | ID único para busca no frontend (ex: "texto_boas_vindas") |
| `titulo`        | VARCHAR(255) | Nome amigável da configuração                             |
| `texto`         | TEXT         | Texto principal (opcional)                                |
| `descricao`     | TEXT         | Descrição/texto longo (opcional)                          |
| `tipo`          | VARCHAR(50)  | Tipo: texto, descricao, html, json                        |
| `categoria`     | VARCHAR(50)  | Categoria: geral, homepage, produtos, etc.                |
| `ativo`         | BOOLEAN      | Se a configuração está ativa                              |
| `ordem`         | INTEGER      | Ordem de exibição                                         |
| `created_at`    | TIMESTAMP    | Data de criação                                           |
| `updated_at`    | TIMESTAMP    | Data de atualização                                       |

## API Endpoints

### 1. API Pública (Frontend)

**GET `/api/configuracoes`**

- Retorna todas as configurações ativas
- Cache: 5 minutos
- Ordenação: categoria, ordem

**GET `/api/configuracoes?id=IDENTIFICADOR`**

- Retorna configuração específica por identificador
- Cache: 5 minutos

**Exemplo de Resposta:**

```json
{
  "configuracao": {
    "id": 1,
    "identificador": "texto_boas_vindas",
    "titulo": "Texto de Boas-vindas",
    "texto": "Bem-vindos à TurattiMT!",
    "descricao": "Somos uma empresa especializada em ferramentas...",
    "tipo": "texto",
    "categoria": "homepage",
    "ativo": true,
    "ordem": 0
  }
}
```

### 2. API Administrativa

**POST `/api/configuracoes`** - Criar nova configuração
**PUT `/api/configuracoes`** - Atualizar configuração
**DELETE `/api/configuracoes?id=ID`** - Deletar configuração

## Interface Administrativa

### 1. Listagem (`/admin/configuracoes`)

**Funcionalidades:**

- ✅ Visualização em tabela com paginação
- ✅ Filtros por tipo, categoria e status
- ✅ Busca por nome, identificador ou categoria
- ✅ Ativar/desativar configurações
- ✅ Estatísticas (total, ativas, inativas)
- ✅ Editar e excluir configurações

### 2. Criação (`/admin/configuracoes/nova`)

**Campos do Formulário:**

- ✅ **Título**: Nome amigável da configuração
- ✅ **Identificador**: ID único para uso no código
- ✅ **Tipo**: texto, descrição, html, json
- ✅ **Categoria**: geral, homepage, produtos, etc.
- ✅ **Texto**: Conteúdo principal
- ✅ **Descrição**: Texto longo/detalhado
- ✅ **Ordem**: Ordem de exibição
- ✅ **Status**: Ativo/inativo

**Validações:**

- ✅ Identificador único e formato válido
- ✅ Título obrigatório
- ✅ Pelo menos texto ou descrição preenchido
- ✅ Auto-formatação do identificador

### 3. Edição (`/admin/configuracoes/[id]/editar`)

**Funcionalidades:**

- ✅ Carregamento dos dados existentes
- ✅ Detecção de alterações
- ✅ Validações completas
- ✅ Informações da configuração (ID, datas)
- ✅ Opção de exclusão
- ✅ Indicação visual de alterações não salvas

## Como Usar no Frontend

### 1. Buscar Configuração Específica

```javascript
// Buscar por identificador
const response = await fetch("/api/configuracoes?id=texto_boas_vindas");
const data = await response.json();
const config = data.configuracao;

console.log(config.texto); // "Bem-vindos à TurattiMT!"
console.log(config.descricao); // "Somos uma empresa..."
```

### 2. Buscar Todas as Configurações

```javascript
// Buscar todas as configurações ativas
const response = await fetch("/api/configuracoes");
const data = await response.json();
const configuracoes = data.configuracoes;

// Filtrar por categoria
const configsHomepage = configuracoes.filter((c) => c.categoria === "homepage");
```

### 3. Hook React (Recomendado)

```javascript
// hooks/useConfiguracao.js
import { useState, useEffect } from "react";

export function useConfiguracao(identificador) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!identificador) return;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/configuracoes?id=${identificador}`);

        if (!response.ok) {
          throw new Error("Configuração não encontrada");
        }

        const data = await response.json();
        setConfig(data.configuracao);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [identificador]);

  return { config, loading, error };
}

// Uso no componente
function BoasVindas() {
  const { config, loading, error } = useConfiguracao("texto_boas_vindas");

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!config) return null;

  return (
    <div>
      <h1>{config.texto}</h1>
      <p>{config.descricao}</p>
    </div>
  );
}
```

## Tipos de Configuração

### 1. **Texto** (`tipo: "texto"`)

- Textos curtos como títulos, labels, mensagens
- Exemplo: "Bem-vindos à TurattiMT!"

### 2. **Descrição** (`tipo: "descricao"`)

- Textos longos como parágrafos, instruções
- Exemplo: Descrição da empresa, termos de uso

### 3. **HTML** (`tipo: "html"`)

- Conteúdo HTML para áreas específicas
- Exemplo: Banners personalizados, seções especiais

### 4. **JSON** (`tipo: "json"`)

- Dados estruturados em formato JSON
- Exemplo: Configurações de layout, listas de dados

## Categorias Padrão

- **geral**: Configurações gerais do sistema
- **homepage**: Conteúdos da página inicial
- **produtos**: Textos relacionados aos produtos
- **contato**: Informações de contato
- **sobre**: Conteúdos da página sobre
- **servicos**: Descrições de serviços
- **footer**: Textos do rodapé
- **header**: Textos do cabeçalho

## Exemplos de Uso Prático

### 1. Texto de Boas-vindas

```
Identificador: texto_boas_vindas
Título: Texto de Boas-vindas
Tipo: texto
Categoria: homepage
Texto: "Bem-vindos à TurattiMT - Sua loja de ferramentas!"
```

### 2. Descrição da Empresa

```
Identificador: descricao_empresa
Título: Descrição da Empresa
Tipo: descricao
Categoria: sobre
Descrição: "A TurattiMT é uma empresa especializada..."
```

### 3. Termos de Uso

```
Identificador: termos_uso
Título: Termos de Uso
Tipo: html
Categoria: geral
Texto: "<h2>Termos de Uso</h2><p>Ao utilizar...</p>"
```

### 4. Configurações de Layout

```
Identificador: config_layout_produtos
Título: Configurações de Layout dos Produtos
Tipo: json
Categoria: produtos
Texto: {"itens_por_linha": 4, "mostrar_descricao": true}
```

## Benefícios do Sistema

1. **Flexibilidade**: Textos editáveis sem mexer no código
2. **Organização**: Sistema de categorias e tipos
3. **Performance**: Cache automático nas consultas
4. **SEO**: Fácil atualização de conteúdos para SEO
5. **Manutenção**: Não precisa de deploy para alterar textos
6. **Versionamento**: Histórico de alterações no banco
7. **Controle**: Ativar/desativar configurações conforme necessário

## Integração no Menu Admin

O sistema foi integrado ao painel administrativo com:

- ✅ Item "Configurações" no menu lateral
- ✅ Ícone de engrenagem (CogIcon)
- ✅ Rota `/admin/configuracoes`
- ✅ Detecção de rota ativa

## Segurança e Validações

- ✅ Identificadores únicos e validados
- ✅ Sanitização automática de identificadores
- ✅ Validação de campos obrigatórios
- ✅ Cache com tempo controlado
- ✅ Tratamento de erros robusto

---

**Status: ✅ IMPLEMENTADO E FUNCIONAL**  
**Data: Janeiro 2025**  
**Versão: 1.0**
