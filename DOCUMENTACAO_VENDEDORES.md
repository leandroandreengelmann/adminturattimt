# Sistema de Vendedores TurattiMT - Documentação Completa

## Visão Geral

O sistema de vendedores permite o cadastro e gerenciamento de vendedores associados às lojas, incluindo informações de contato via WhatsApp, especialidades e fotos de perfil.

## Estrutura do Banco de Dados

### Tabela: `vendedores`

```sql
CREATE TABLE IF NOT EXISTS vendedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    especialidade VARCHAR(200),
    whatsapp VARCHAR(20) NOT NULL,
    foto_url VARCHAR(500),
    loja_id INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE
);
```

#### Campos da Tabela

- **id**: Identificador único do vendedor (PRIMARY KEY)
- **nome**: Nome completo do vendedor (obrigatório, máx. 150 caracteres)
- **especialidade**: Área de especialidade do vendedor (opcional, máx. 200 caracteres)
- **whatsapp**: Número do WhatsApp para contato (obrigatório, apenas números, 10-11 dígitos)
- **foto_url**: URL da foto de perfil (opcional, máx. 500 caracteres)
- **loja_id**: ID da loja associada (obrigatório, foreign key)
- **ativo**: Status do vendedor (padrão: true)
- **ordem**: Ordem de exibição (padrão: 0)
- **created_at**: Data de criação (automático)
- **updated_at**: Data da última atualização (automático via trigger)

#### Índices e Constraints

- Índice em `ativo` para otimizar filtros de status
- Índice em `loja_id` para otimizar consultas por loja
- Índice em `ordem` para otimizar ordenação
- Foreign key com `lojas(id)` com CASCADE DELETE
- Trigger automático para atualizar `updated_at`

## Interface Administrativa

### 1. Página Principal (`/admin/vendedores`)

#### Características

- **Layout**: Grid responsivo com cards de vendedores
- **Filtros**: Por loja, status (ativo/inativo) e busca textual
- **Informações por Card**:
  - Foto de perfil (ou inicial do nome se não tiver foto)
  - Nome do vendedor
  - Status (ativo/inativo) com badge colorido
  - Especialidade (se informada)
  - Loja associada
  - Número do WhatsApp
  - Botão direto para WhatsApp
  - Ordem de exibição
  - Data de criação

#### Funcionalidades

- **Busca Textual**: Nome, especialidade ou WhatsApp
- **Filtro por Loja**: Dropdown com todas as lojas ativas
- **Filtro por Status**: Todos, Ativos, Inativos
- **Ações por Vendedor**:
  - Ativar/Desativar (toggle de status)
  - Editar (navegação para página de edição)
  - Excluir (com confirmação)
  - Contatar via WhatsApp (abre link direto)

#### Estados da Interface

- **Loading**: Skeleton com animação durante carregamento
- **Vazio**: Mensagem quando não há vendedores
- **Filtrado**: Mensagem quando filtros não retornam resultados
- **Erro**: Tratamento de erros de conexão

### 2. Página de Criação (`/admin/vendedores/novo`)

#### Formulário de Cadastro

- **Nome**: Campo obrigatório, validação de preenchimento
- **WhatsApp**: Campo obrigatório com máscara (XX) XXXXX-XXXX, validação de formato
- **Especialidade**: Campo opcional, textarea para descrição
- **Loja**: Dropdown obrigatório com lojas ativas
- **Ordem**: Campo numérico para ordem de exibição
- **Status**: Select para ativo/inativo
- **Foto de Perfil**: Upload opcional de imagem

#### Upload de Imagem

- **Tipos Aceitos**: PNG, JPG, JPEG
- **Tamanho Máximo**: 5MB
- **Validações**: Tipo de arquivo e tamanho
- **Preview**: Visualização em tempo real
- **Storage**: Supabase Storage bucket 'uploads'
- **Organização**: Pasta 'vendedores/' com nome único

#### Preview em Tempo Real

- Card simulando aparência final
- Atualização dinâmica conforme preenchimento
- Validação visual dos dados

#### Validações Client-side

- Nome obrigatório
- WhatsApp obrigatório e formato válido (10-11 dígitos)
- Loja obrigatória
- Ordem numérica positiva
- Validação de imagem (tipo e tamanho)

### 3. Página de Edição (`/admin/vendedores/[id]/editar`)

#### Funcionalidades

- **Carregamento Automático**: Dados do vendedor preenchidos automaticamente
- **Formulário Preenchido**: Todos os campos com valores atuais
- **Edição de Foto**: Manter atual, alterar ou remover
- **Botão de Exclusão**: Integrado na página com confirmação
- **Validações**: Mesmas da criação
- **Preview Atualizado**: Reflexo das alterações em tempo real

#### Seção de Auditoria

- **ID do Vendedor**: Identificador único
- **Data de Criação**: Timestamp formatado
- **Última Atualização**: Timestamp formatado
- **Status Atual**: Badge visual do status

#### Estados e Tratamento

- **Loading**: Durante carregamento dos dados
- **Não Encontrado**: Redirecionamento se vendedor não existir
- **Erro de Carregamento**: Fallback para lista principal
- **Validação**: Feedback visual de erros

## API Pública

### Endpoint: `/api/vendedores`

#### Método GET

**URL**: `GET /api/vendedores`

**Parâmetros Query**:

- `loja_id` (opcional): Filtrar vendedores por loja específica

**Resposta de Sucesso (200)**:

```json
{
  "vendedores": [
    {
      "id": 1,
      "nome": "João Silva",
      "especialidade": "Produtos Eletrônicos",
      "whatsapp": "11999999999",
      "foto_url": "https://...",
      "loja_id": 1,
      "ordem": 1,
      "loja": {
        "id": 1,
        "nome": "Loja Centro"
      },
      "whatsapp_url": "https://wa.me/5511999999999?text=Olá%20João%20Silva,%20vim%20através%20do%20site%20da%20TurattiMT!"
    }
  ],
  "total": 1,
  "loja_filtro": 1
}
```

**Características da API**:

- **Cache**: 5 minutos (300 segundos)
- **Filtro Automático**: Apenas vendedores ativos
- **Ordenação**: Por campo `ordem` (ASC)
- **Joins**: Inclui dados da loja associada
- **URL WhatsApp**: Gerada automaticamente com mensagem padrão
- **Headers de Cache**: Configurados para performance

**Casos de Uso**:

- Listagem pública de vendedores para site
- Integração com sistemas externos
- Widgets de contato por loja
- APIs de terceiros

## Integração no Sistema

### Menu Lateral

- **Ícone**: UserIcon (Heroicons)
- **Posição**: Após "Redes Sociais"
- **Rota**: `/admin/vendedores`
- **Detecção de Ativa**: Para highlight da navegação

### Dashboard Administrativo

- **Estatísticas Adicionadas**:
  - Total de Vendedores
  - Vendedores Ativos
- **Cards no Dashboard**: Cores cyan (total) e blue (ativos)
- **Ação Rápida**: Botão "Novo Vendedor"
- **Consulta Paralela**: Otimização de performance

### Breadcrumbs e Navegação

- Estrutura hierárquica clara
- Links de retorno em todas as páginas
- Navegação consistente com o padrão do sistema

## Validações e Regras de Negócio

### Validações de Entrada

1. **Nome**: Obrigatório, mínimo 2 caracteres
2. **WhatsApp**: Obrigatório, formato brasileiro (10-11 dígitos)
3. **Loja**: Obrigatória, deve existir e estar ativa
4. **Especialidade**: Opcional, máximo 200 caracteres
5. **Ordem**: Numérico, positivo ou zero
6. **Foto**: Opcional, PNG/JPG, máximo 5MB

### Regras de Negócio

- Vendedor só pode ser associado a uma loja ativa
- WhatsApp deve ser único por loja (recomendado)
- Ordem de exibição permite duplicatas
- Exclusão de loja remove vendedores associados (CASCADE)
- Status inativo remove da API pública mas mantém no admin

### Formatação Automática

- **WhatsApp**: Aplicação de máscara (XX) XXXXX-XXXX
- **URL WhatsApp**: Geração automática com mensagem padrão
- **Timestamps**: Formatação brasileira (DD/MM/AAAA)

## Design e UX

### Padrões Visuais

- **Cores**: Seguem paleta do sistema (blue, green, red)
- **Tipografia**: Tailwind CSS padrão
- **Espaçamento**: Grid de 6px (1.5rem)
- **Responsividade**: Mobile-first design

### Estados Interativos

- **Hover**: Transições suaves (200ms)
- **Loading**: Skeletons e spinners
- **Feedback**: Toasts para ações importantes
- **Confirmações**: Modais para ações destrutivas

### Acessibilidade

- **Labels**: Todos os campos com labels apropriados
- **ARIA**: Atributos para screen readers
- **Contraste**: Cores seguem WCAG 2.1
- **Keyboard**: Navegação por teclado funcional

## Performance e Otimização

### Cache Strategy

- **API Pública**: Cache de 5 minutos
- **Imagens**: CDN do Supabase Storage
- **Consultas**: Joins otimizados com índices

### Otimizações de Banco

- **Índices**: Em campos frequentemente consultados
- **Foreign Keys**: Para integridade referencial
- **Triggers**: Atualização automática de timestamps

### Frontend

- **Loading States**: Skeleton UI durante carregamento
- **Lazy Loading**: Imagens carregadas sob demanda
- **Debounce**: Em campos de busca
- **Parallel Queries**: Consultas simultâneas no dashboard

## Tratamento de Erros

### Tipos de Erro

1. **Validação**: Feedback visual nos campos
2. **Rede**: Mensagens de conectividade
3. **Servidor**: Fallbacks graceful
4. **Upload**: Retry automático para imagens
5. **404**: Redirecionamento para listagem

### Logs e Monitoramento

- Console.error para debugging
- Supabase error tracking
- User feedback via toasts

## Casos de Uso

### Administrador

1. **Cadastrar Vendedor**: Adicionar novo membro da equipe
2. **Gerenciar Status**: Ativar/desativar vendedores
3. **Atualizar Informações**: Editar dados de contato
4. **Organizar Exibição**: Definir ordem de apresentação
5. **Monitorar Estatísticas**: Acompanhar total de vendedores

### Cliente Final (via API)

1. **Encontrar Vendedor**: Por loja específica
2. **Contatar WhatsApp**: Link direto para conversa
3. **Ver Especialidade**: Identificar expertise
4. **Visualizar Foto**: Reconhecimento visual

### Sistema

1. **Integração com Lojas**: Associação automática
2. **Cache Inteligente**: Performance otimizada
3. **Backup Automático**: Via Supabase
4. **Escalabilidade**: Pronto para crescimento

## Fluxos de Trabalho

### Fluxo de Cadastro

1. Admin acessa `/admin/vendedores`
2. Clica em "Novo Vendedor"
3. Preenche informações obrigatórias
4. Faz upload de foto (opcional)
5. Visualiza preview
6. Confirma criação
7. Retorna para listagem

### Fluxo de Edição

1. Admin localiza vendedor na listagem
2. Clica em "Editar"
3. Modifica campos necessários
4. Atualiza foto (se necessário)
5. Confirma alterações
6. Retorna para listagem

### Fluxo de Contato (Cliente)

1. Cliente acessa página da loja
2. Visualiza vendedores disponíveis
3. Identifica especialidade desejada
4. Clica em "Contatar"
5. Abre WhatsApp com mensagem pré-definida
6. Inicia conversa com vendedor

## Considerações de Segurança

### Validações de Upload

- Verificação de tipo MIME
- Limitação de tamanho
- Sanitização de nomes de arquivo
- Storage isolado no Supabase

### Proteção de Dados

- Whatsapp mascarado no frontend
- URLs de imagem com controle de acesso
- Logs de auditoria via updated_at

### Controle de Acesso

- Acesso admin apenas autenticado
- API pública sem dados sensíveis
- Rate limiting via Supabase

## Roadmap e Melhorias Futuras

### Funcionalidades Planejadas

1. **Múltiplos Contatos**: Email, telefone fixo
2. **Agenda**: Disponibilidade de horários
3. **Métricas**: Tracking de conversões
4. **Chat Integration**: Widget de chat direto
5. **Certificações**: Upload de certificados
6. **Avaliações**: Sistema de ratings
7. **Localização**: GPS para vendedores externos
8. **Notificações**: Push para novos contatos

### Melhorias Técnicas

1. **TypeScript Strict**: Tipagem mais rigorosa
2. **Testing**: Unit e integration tests
3. **PWA**: App progressivo
4. **Offline**: Funcionamento sem internet
5. **Analytics**: Google Analytics integration
6. **SEO**: Meta tags otimizadas
7. **Compression**: Otimização de imagens
8. **CDN**: Distribution global

## Conclusão

O sistema de vendedores TurattiMT oferece uma solução completa para gestão de equipes comerciais associadas às lojas, com interface administrativa intuitiva, API pública otimizada e integração seamless com o restante do sistema.

O design responsivo, validações robustas e arquitetura escalável garantem uma experiência de usuário superior tanto para administradores quanto para clientes finais, facilitando o contato direto via WhatsApp e otimizando o processo de vendas da empresa.

A documentação detalhada e estrutura bem definida permitem manutenção eficiente e evolução contínua do sistema, alinhado com as necessidades de crescimento da TurattiMT.
