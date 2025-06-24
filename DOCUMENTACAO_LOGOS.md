# Sistema de Logos - TurattiMT

## Visão Geral

O sistema de logos permite o gerenciamento completo de logotipos para o cabeçalho e rodapé do site. Inclui funcionalidades para upload de imagens, categorização por tipo (branca/azul) e posição (cabeçalho/rodapé), além de controle de ativação/desativação.

## Estrutura do Banco de Dados

### Tabela: `logos`

```sql
CREATE TABLE logos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('branca', 'azul')),
    posicao VARCHAR(20) NOT NULL CHECK (posicao IN ('cabecalho', 'rodape')),
    imagem_url TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_logos_tipo ON logos(tipo);
CREATE INDEX idx_logos_posicao ON logos(posicao);
CREATE INDEX idx_logos_ativo ON logos(ativo);
```

### Campos da Tabela

- **id**: Identificador único UUID
- **nome**: Nome descritivo do logo
- **tipo**: Tipo do logo ('branca' ou 'azul')
- **posicao**: Posição de exibição ('cabecalho' ou 'rodape')
- **imagem_url**: URL da imagem no storage
- **ativo**: Status de ativação (true/false)
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

## Funcionalidades Implementadas

### 1. Interface Administrativa

#### Página de Listagem (`/admin/logos`)

- ✅ Visualização em cards com preview das imagens
- ✅ Filtros por tipo, posição e status
- ✅ Busca por nome
- ✅ Toggle para ativar/desativar logos
- ✅ Estatísticas em tempo real
- ✅ Links para edição e visualização

#### Página de Criação (`/admin/logos/novo`)

- ✅ Formulário completo com validação
- ✅ Upload de imagem com preview
- ✅ Seleção de tipo (Branca/Azul)
- ✅ Seleção de posição (Cabeçalho/Rodapé)
- ✅ Status ativo/inativo
- ✅ Validação de arquivo (tipo e tamanho)

#### Página de Edição (`/admin/logos/[id]/editar`)

- ✅ Carregamento dos dados existentes
- ✅ Edição de todas as informações
- ✅ Troca de imagem opcional
- ✅ Função de exclusão com confirmação
- ✅ Histórico de datas (criação/atualização)

### 2. API Pública

#### Endpoint GET `/api/logos`

**Parâmetros de Query:**

- `tipo`: Filtrar por tipo ('branca' ou 'azul')
- `posicao`: Filtrar por posição ('cabecalho' ou 'rodape')

**Exemplo de Uso:**

```bash
# Todos os logos ativos
GET /api/logos

# Logos brancos do cabeçalho
GET /api/logos?tipo=branca&posicao=cabecalho

# Logos azuis do rodapé
GET /api/logos?tipo=azul&posicao=rodape
```

**Resposta:**

```json
{
  "logos": [
    {
      "id": "uuid",
      "nome": "Logo Principal Branca - Cabeçalho",
      "tipo": "branca",
      "posicao": "cabecalho",
      "imagem_url": "https://...",
      "ativo": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "filtros": {
    "tipo": "branca",
    "posicao": "cabecalho"
  }
}
```

#### Cache

- ✅ Cache de 5 minutos com `stale-while-revalidate`
- ✅ Headers de cache configurados

### 3. Integração no Dashboard

- ✅ Estatísticas de total de logos
- ✅ Contador de logos ativos
- ✅ Cards de resumo integrados
- ✅ Navegação rápida

### 4. Menu de Navegação

- ✅ Item "Logos" no menu lateral do admin
- ✅ Ícone `RectangleStackIcon` para diferenciação
- ✅ Destaque quando na seção ativa

## Recursos de Upload

### Validações de Imagem

- **Tipos aceitos**: PNG, JPG/JPEG
- **Tamanho máximo**: 5MB
- **Recomendação**: Otimização para web

### Storage

- ✅ Upload para Supabase Storage
- ✅ Organização na pasta `logos/`
- ✅ Nomenclatura única: `logo-{timestamp}.{ext}`
- ✅ URLs públicas geradas automaticamente

## Interface de Usuário

### Design

- ✅ Cards responsivos com preview de imagens
- ✅ Badges coloridas para tipo e posição
- ✅ Status visual com ícones emoji
- ✅ Layout grid adaptativo

### Filtros e Busca

- ✅ Busca por nome em tempo real
- ✅ Filtro por tipo (Todos, Branca, Azul)
- ✅ Filtro por posição (Todos, Cabeçalho, Rodapé)
- ✅ Filtro por status (Todos, Ativos, Inativos)

### Experiência do Usuário

- ✅ Preview de imagens em tempo real
- ✅ Feedback visual para todas as ações
- ✅ Confirmação para ações destrutivas
- ✅ Loading states durante operações

## Configuração de Tipos e Posições

### Tipos Disponíveis

1. **Branca** (⚪)

   - Para fundos escuros
   - Identificada por emoji de círculo branco

2. **Azul** (🔵)
   - Para fundos claros
   - Identificada por emoji de círculo azul

### Posições Disponíveis

1. **Cabeçalho** (⬆️)

   - Exibição no topo do site
   - Identificada por emoji de seta para cima

2. **Rodapé** (⬇️)
   - Exibição no final do site
   - Identificada por emoji de seta para baixo

## Segurança e Validação

### Validações de Backend

- ✅ Verificação de tipos de arquivo
- ✅ Limitação de tamanho de upload
- ✅ Validação de campos obrigatórios
- ✅ Sanitização de dados

### Controle de Acesso

- ✅ Área administrativa protegida
- ✅ API pública somente leitura
- ✅ Apenas logos ativos na API pública

## Performance

### Otimizações

- ✅ Índices no banco de dados
- ✅ Cache de API com stale-while-revalidate
- ✅ Carregamento lazy de imagens
- ✅ Compressão de imagens no frontend

### Monitoramento

- ✅ Logs de erros detalhados
- ✅ Tratamento de falhas de upload
- ✅ Fallback para imagens quebradas

## Como Usar

### Para Desenvolvedores

```typescript
// Buscar logos do cabeçalho
const response = await fetch("/api/logos?posicao=cabecalho");
const data = await response.json();
const logosCabecalho = data.logos;

// Buscar logos brancos
const response = await fetch("/api/logos?tipo=branca");
const data = await response.json();
const logosBrancos = data.logos;
```

### Para Administradores

1. **Criar Novo Logo:**

   - Acesse `/admin/logos`
   - Clique em "Novo Logo"
   - Preencha as informações
   - Faça upload da imagem
   - Salve o logo

2. **Editar Logo Existente:**

   - Na listagem, clique em "Editar"
   - Modifique as informações necessárias
   - Troque a imagem se necessário
   - Salve as alterações

3. **Ativar/Desativar Logo:**
   - Use o toggle na listagem
   - Ou edite o logo e modifique o status

## Estrutura de Arquivos

```
app/
├── admin/logos/
│   ├── page.tsx                    # Listagem de logos
│   ├── novo/page.tsx              # Criar novo logo
│   └── [id]/editar/page.tsx       # Editar logo
├── api/logos/
│   └── route.ts                   # API pública
└── admin/page.tsx                 # Dashboard (com estatísticas)

components/
└── AdminLayout.tsx                # Menu com item Logos

DOCUMENTACAO_LOGOS.md             # Esta documentação
```

## Próximas Funcionalidades

### Possíveis Melhorias

- [ ] Redimensionamento automático de imagens
- [ ] Versionamento de logos
- [ ] Agendamento de ativação/desativação
- [ ] Histórico de alterações
- [ ] Backup automático de imagens
- [ ] Integração com CDN
- [ ] Compressão automática de imagens
- [ ] Múltiplos formatos (WebP, AVIF)

### Integrações Futuras

- [ ] Sistema de aprovação de logos
- [ ] Notificações de alterações
- [ ] Relatórios de uso
- [ ] Análise de performance de logos

## Conclusão

O sistema de logos está completamente funcional e integrado ao painel administrativo do TurattiMT. Oferece uma solução completa para o gerenciamento de logotipos com interface intuitiva, API robusta e funcionalidades avançadas de filtro e busca.

A arquitetura modular permite fácil manutenção e expansão futura, seguindo as melhores práticas de desenvolvimento web moderno.

---

**Última atualização:** Janeiro 2024  
**Versão:** 1.0.0  
**Status:** ✅ Completo e Funcional
