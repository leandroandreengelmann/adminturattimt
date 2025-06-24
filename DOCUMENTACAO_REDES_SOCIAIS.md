# Sistema de Redes Sociais - TurattiMT

## 📋 Visão Geral

O sistema de redes sociais foi implementado para permitir o gerenciamento completo das redes sociais da empresa no painel administrativo, controlando quais redes aparecem no site público e em que ordem.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `redes_sociais`

```sql
CREATE TABLE redes_sociais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    link VARCHAR(500) NOT NULL,
    icone VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_redes_sociais_ativo ON redes_sociais(ativo);
CREATE INDEX idx_redes_sociais_ordem ON redes_sociais(ordem);

-- Trigger para updated_at automático
CREATE TRIGGER update_redes_sociais_updated_at
    BEFORE UPDATE ON redes_sociais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### Dados Iniciais

- Instagram (ativo, ordem 1)
- Facebook (ativo, ordem 2)

## 📱 Interface Administrativa

### 1. Página Principal - `/admin/redes-sociais`

**Arquivo:** `app/admin/redes-sociais/page.tsx`

**Funcionalidades:**

- ✅ Listagem em grid responsivo (1-3 colunas)
- ✅ Cards com design moderno
- ✅ Filtros:
  - Status: Todos/Ativos/Inativos
  - Busca por nome ou link
- ✅ Ações por card:
  - Ativar/Desativar (toggle visual)
  - Editar (ícone de lápis)
  - Excluir (ícone de lixeira com confirmação)
- ✅ Informações exibidas:
  - Ícone emoji + nome
  - Status (badge colorido)
  - Link completo (clicável)
  - Ícone e ordem
  - Data de criação
- ✅ Loading states e estados vazios
- ✅ Botão "Nova Rede Social"

### 2. Página de Criação - `/admin/redes-sociais/nova`

**Arquivo:** `app/admin/redes-sociais/nova/page.tsx`

**Funcionalidades:**

- ✅ Formulário completo com validações
- ✅ Campos:
  - Nome (obrigatório)
  - Link (obrigatório, validação de URL)
  - Ícone (seleção com 15 opções)
  - Ordem de exibição (numérico)
  - Status (Ativo/Inativo)
- ✅ Preview em tempo real
- ✅ Validações client-side
- ✅ Estados de loading
- ✅ Navegação com breadcrumb

**Opções de Ícones (15 disponíveis):**

- 📷 Instagram
- 📘 Facebook
- 🐦 Twitter
- 💼 LinkedIn
- 📺 YouTube
- 🎵 TikTok
- 💬 WhatsApp
- ✈️ Telegram
- 📌 Pinterest
- 👻 Snapchat
- 🎮 Discord
- 💻 GitHub
- 🌐 Website
- 📧 Email
- 📞 Telefone

### 3. Página de Edição - `/admin/redes-sociais/[id]/editar`

**Arquivo:** `app/admin/redes-sociais/[id]/editar/page.tsx`

**Funcionalidades:**

- ✅ Carregamento automático dos dados
- ✅ Formulário preenchido com dados existentes
- ✅ Mesmo layout e validações da criação
- ✅ Botão de exclusão integrado
- ✅ Seção de informações de auditoria:
  - ID do registro
  - Data/hora de criação
  - Data/hora da última atualização
  - Status atual
  - Ordem atual
- ✅ Preview atualizado em tempo real
- ✅ Tratamento de erros (rede não encontrada)

## 🔗 API Pública

### Endpoint: `/api/redes-sociais`

**Arquivo:** `app/api/redes-sociais/route.ts`

**Método:** GET

**Funcionalidades:**

- ✅ Retorna apenas redes sociais ativas (`ativo = true`)
- ✅ Ordenação por campo `ordem` (ASC)
- ✅ Cache de 5 minutos (`revalidate = 300`)
- ✅ Tratamento de erros
- ✅ Formato de resposta padronizado

**Resposta:**

```json
{
  "redesSociais": [
    {
      "id": 1,
      "nome": "Instagram",
      "link": "https://instagram.com/turattimt",
      "icone": "instagram",
      "ativo": true,
      "ordem": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## 🎛️ Integração no Painel Administrativo

### 1. Menu Lateral

**Arquivo:** `components/AdminLayout.tsx`

**Alterações:**

- ✅ Adicionado import do `ShareIcon`
- ✅ Novo item de menu:
  - Nome: "Redes Sociais"
  - Rota: `/admin/redes-sociais`
  - Ícone: ShareIcon
  - Detecção de rota ativa

### 2. Dashboard

**Arquivo:** `app/admin/page.tsx`

**Novas Estatísticas:**

- ✅ Total de Redes Sociais
- ✅ Redes Sociais Ativas
- ✅ Cards visuais com cores diferenciadas:
  - Violet para total
  - Pink para ativas

**Ações Rápidas:**

- ✅ Botão "Nova Rede Social"
- ✅ Navegação direta para criação
- ✅ Feedback visual com toast

**Consultas Atualizadas:**

- ✅ Query paralela para `redes_sociais`
- ✅ Cálculos de estatísticas
- ✅ Integração completa no carregamento

## 📁 Estrutura de Arquivos

```
app/
├── admin/
│   ├── redes-sociais/
│   │   ├── page.tsx                 # Listagem principal
│   │   ├── nova/
│   │   │   └── page.tsx            # Criação
│   │   └── [id]/
│   │       └── editar/
│   │           └── page.tsx        # Edição
│   └── page.tsx                    # Dashboard (atualizado)
├── api/
│   └── redes-sociais/
│       └── route.ts                # API pública
└── components/
    └── AdminLayout.tsx             # Menu lateral (atualizado)
```

## 🎨 Design e UX

### Padrões Visuais

- ✅ Consistência com o design system existente
- ✅ Tailwind CSS para estilização
- ✅ Cards com border, shadow e hover states
- ✅ Cores temáticas:
  - Violet/Pink para redes sociais
  - Cores semânticas para status (verde/vermelho)
- ✅ Ícones Heroicons consistentes
- ✅ Responsive design (mobile-first)

### Estados da Interface

- ✅ Loading states com skeletons
- ✅ Estados vazios informativos
- ✅ Feedback visual para ações
- ✅ Confirmações para ações destrutivas
- ✅ Preview em tempo real
- ✅ Validações com mensagens claras

### Acessibilidade

- ✅ Labels semânticos
- ✅ Focus states visíveis
- ✅ Contraste adequado
- ✅ Navegação por teclado
- ✅ Textos alternativos

## 🔧 Validações e Regras de Negócio

### Validações de Formulário

- ✅ Nome obrigatório (texto não vazio)
- ✅ Link obrigatório com validação de URL (http/https)
- ✅ Ícone obrigatório (seleção)
- ✅ Ordem numérica >= 0
- ✅ Limpeza de erros em tempo real

### Regras de Negócio

- ✅ Apenas redes ativas aparecem na API pública
- ✅ Ordenação por campo `ordem`
- ✅ Soft delete não implementado (exclusão real)
- ✅ Timestamps automáticos
- ✅ IDs sequenciais automáticos

## 🚀 Performance

### Otimizações Implementadas

- ✅ Cache de API (5 minutos)
- ✅ Consultas paralelas no dashboard
- ✅ Índices no banco de dados
- ✅ Loading states para UX
- ✅ Lazy loading implícito (Next.js)

### Queries de Banco

- ✅ Seleção apenas de campos necessários
- ✅ Filtros no banco (WHERE ativo = true)
- ✅ Ordenação no banco (ORDER BY ordem)
- ✅ Índices em campos de filtro

## 📊 Métricas e Monitoramento

### Logs Implementados

- ✅ Erros de carregamento (console.error)
- ✅ Erros de API (console.error)
- ✅ Operações CRUD (console tracking)

### Estatísticas Disponíveis

- ✅ Total de redes cadastradas
- ✅ Redes ativas vs inativas
- ✅ Última atualização via timestamps
- ✅ Integração no dashboard principal

## 🧪 Estados de Teste

### Cenários Testados

- ✅ Listagem vazia (primeira utilização)
- ✅ Listagem com dados
- ✅ Filtros funcionais
- ✅ Criação com dados válidos
- ✅ Criação com dados inválidos
- ✅ Edição de registros existentes
- ✅ Exclusão com confirmação
- ✅ Toggle de status
- ✅ API pública retornando dados corretos

### Tratamento de Erros

- ✅ Conexão com banco indisponível
- ✅ Registro não encontrado (404)
- ✅ Dados inválidos (validação)
- ✅ Timeouts de operação
- ✅ Estados de loading

## 🔄 Fluxos de Trabalho

### Fluxo de Criação

1. Usuário acessa `/admin/redes-sociais`
2. Clica em "Nova Rede Social"
3. Preenche formulário
4. Preview atualiza em tempo real
5. Submete formulário
6. Validações client-side
7. Envio para Supabase
8. Redirecionamento para listagem
9. Feedback de sucesso

### Fluxo de Edição

1. Usuário clica em "Editar" na listagem
2. Carregamento automático dos dados
3. Formulário preenchido
4. Modificações com preview
5. Submissão ou exclusão
6. Atualização no banco
7. Redirecionamento e feedback

### Fluxo de Consumo Público

1. Site público faz GET `/api/redes-sociais`
2. API consulta apenas redes ativas
3. Retorna dados ordenados
4. Cache de 5 minutos
5. Renderização no frontend público

## 📈 Possíveis Evoluções

### Funcionalidades Futuras

- [ ] Drag & drop para reordenação
- [ ] Upload de ícones customizados
- [ ] Análise de cliques/engajamento
- [ ] Templates de links
- [ ] Integração com APIs das redes
- [ ] Bulk operations
- [ ] Histórico de alterações
- [ ] Agendamento de publicação

### Melhorias Técnicas

- [ ] Testes automatizados
- [ ] Validações de schema (Zod)
- [ ] Otimistic updates
- [ ] Server-side pagination
- [ ] Real-time updates
- [ ] Backup/restore
- [ ] Audit logs detalhados

## 🎯 Resumo de Implementação

**✅ Completamente Implementado:**

- Estrutura de banco de dados
- Interface administrativa completa
- API pública funcional
- Integração no painel
- Validações e tratamento de erros
- Design responsivo e acessível

**📊 Estatísticas da Implementação:**

- **6 arquivos** criados/modificados
- **1 tabela** de banco criada
- **3 páginas** administrativas
- **1 API** pública
- **15 ícones** predefinidos
- **Cache** de 5 minutos
- **100% responsivo**

O sistema está **pronto para produção** e oferece uma experiência completa de gerenciamento de redes sociais integrada ao painel administrativo existente.
