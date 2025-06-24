# Documentação do Sistema de Lojas - TurattiMT

## Índice

1. [Visão Geral](#visão-geral)
2. [Evolução do Sistema](#evolução-do-sistema)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Arquivos Implementados](#arquivos-implementados)
5. [Funcionalidades](#funcionalidades)
6. [Tecnologias Utilizadas](#tecnologias-utilizadas)
7. [Endpoints e APIs](#endpoints-e-apis)
8. [Componentes](#componentes)
9. [Validações](#validações)
10. [Estrutura de Uploads](#estrutura-de-uploads)

## Visão Geral

Sistema completo de gerenciamento de lojas desenvolvido com Next.js 15.3.3 e Supabase, incluindo múltiplos telefones e galeria de imagens com upload real.

## Evolução do Sistema

### Fase 1: Sistema Básico

- Campo único de telefone (VARCHAR)
- Campos básicos de loja (nome, endereço, etc.)
- Interface simples de listagem

### Fase 2: Múltiplos Telefones

- Migration para transformar `telefone` em `telefones` (JSONB)
- Suporte a até 5 telefones por loja
- Formatação automática de números

### Fase 3: Sistema de Imagens com URLs

- Adição de 10 campos de imagem
- Sistema de imagem principal
- Interface com campos de URL

### Fase 4: Sistema de Upload Real

- Implementação de upload de arquivos
- Componente dedicado para upload
- Validações de tipo e tamanho
- Sistema de preview e gerenciamento

## Estrutura do Banco de Dados

### Tabela: `lojas`

```sql
-- Campos básicos
id                     BIGINT PRIMARY KEY
nome                   VARCHAR(200) NOT NULL
endereco               VARCHAR(500)
bairro                 VARCHAR(100)
cidade                 VARCHAR(100)
estado                 VARCHAR(2)
cep                    VARCHAR(10)
descricao              TEXT
ativo                  BOOLEAN DEFAULT true
created_at             TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
updated_at             TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())

-- Múltiplos telefones
telefones              JSONB DEFAULT '[]'::jsonb

-- Sistema de imagens
imagem_principal       VARCHAR(500)
imagem_2               VARCHAR(500)
imagem_3               VARCHAR(500)
imagem_4               VARCHAR(500)
imagem_5               VARCHAR(500)
imagem_6               VARCHAR(500)
imagem_7               VARCHAR(500)
imagem_8               VARCHAR(500)
imagem_9               VARCHAR(500)
imagem_10              VARCHAR(500)
imagem_principal_index INTEGER DEFAULT 0
```

### Migration Aplicada

```sql
-- Removido campo antigo
ALTER TABLE lojas DROP COLUMN IF EXISTS telefone;

-- Adicionado campo de telefones múltiplos
ALTER TABLE lojas ADD COLUMN telefones JSONB DEFAULT '[]'::jsonb;

-- Adicionados campos de imagens
ALTER TABLE lojas ADD COLUMN imagem_principal VARCHAR(500);
ALTER TABLE lojas ADD COLUMN imagem_2 VARCHAR(500);
-- ... até imagem_10

-- Adicionado índice da imagem principal
ALTER TABLE lojas ADD COLUMN imagem_principal_index INTEGER DEFAULT 0;
```

## Arquivos Implementados

### 1. API de Upload

**Arquivo**: `app/api/upload/route.ts`

- Endpoint POST para upload de imagens
- Validações de tipo e tamanho
- Geração de nomes únicos
- Criação automática de diretórios

### 2. Componente de Upload

**Arquivo**: `components/ImageUpload.tsx`

- Interface para seleção e upload de imagens
- Preview de imagens
- Botões de ação (definir como principal, remover)
- Estados de loading e erro

### 3. Página de Listagem

**Arquivo**: `app/admin/lojas/page.tsx`

- Grid responsivo de lojas
- Sistema de busca integrado
- Preview de imagem principal
- Contador de imagens
- Lista de múltiplos telefones

### 4. Página de Criação

**Arquivo**: `app/admin/lojas/nova/page.tsx`

- Formulário completo de cadastro
- Gerenciamento de múltiplos telefones
- Sistema de upload de imagens
- Validações em tempo real

### 5. Página de Edição

**Arquivo**: `app/admin/lojas/[id]/editar/page.tsx`

- Carregamento de dados existentes
- Preservação de telefones e imagens
- Detecção de alterações
- Sistema de atualização

## Funcionalidades

### Gerenciamento de Telefones

```typescript
// Estrutura de dados
telefones: string[] // Máximo 5 telefones

// Funcionalidades
- Adicionar telefone (até 5)
- Remover telefone (mínimo 1)
- Formatação automática
- Validação de formato brasileiro
```

### Sistema de Imagens

```typescript
// Estrutura de dados
imagens: string[] // 10 posições
imagem_principal_index: number // Índice da imagem principal

// Funcionalidades
- Upload de arquivos PNG/JPG
- Máximo 5MB por arquivo
- Preview automático
- Definição de imagem principal
- Remoção individual
```

### Interface de Listagem

- **Cards Responsivos**: Grid adaptável (1/2/3 colunas)
- **Preview de Imagem**: Área dedicada 192px altura
- **Contador de Imagens**: Badge "X/10" no canto superior
- **Múltiplos Telefones**: Lista vertical formatada
- **Sistema de Busca**: Pesquisa em nome e telefones
- **Ações**: Editar e excluir por loja

### Formulários

- **Validação em Tempo Real**: Feedback imediato
- **Estados de Loading**: Indicadores visuais
- **Mensagens de Erro**: Toasts informativos
- **Preservação de Dados**: Manutenção de estado
- **Responsividade**: Layout adaptável

## Tecnologias Utilizadas

### Frontend

- **Next.js 15.3.3**: Framework React com Turbopack
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework de estilos
- **Heroicons**: Biblioteca de ícones
- **React Hook Form**: Gerenciamento de formulários (implícito)

### Backend

- **Supabase**: Banco PostgreSQL
- **Next.js API Routes**: Endpoints serverless
- **Node.js**: Runtime do servidor

### Upload e Armazenamento

- **Sistema de Arquivos**: Armazenamento local
- **FormData**: Upload de arquivos
- **Validação de MIME Types**: Segurança de arquivos

## Endpoints e APIs

### Upload de Imagens

```typescript
POST /api/upload
Content-Type: multipart/form-data

// Parâmetros
file: File // Arquivo de imagem

// Validações
- Tipo: image/*
- Tamanho: Máximo 5MB

// Retorno
{
  success: true,
  url: "/uploads/lojas/loja_timestamp.ext"
}
```

### CRUD de Lojas

```typescript
// Supabase Client Integration
- Listagem: supabase.from('lojas').select('*')
- Criação: supabase.from('lojas').insert(dados)
- Atualização: supabase.from('lojas').update(dados).eq('id', id)
- Exclusão: supabase.from('lojas').delete().eq('id', id)
```

## Componentes

### ImageUpload

```typescript
interface ImageUploadProps {
  value: string; // URL da imagem atual
  onChange: (url: string) => void; // Callback de mudança
  onSetAsPrincipal?: () => void; // Callback para definir como principal
  isPrincipal?: boolean; // Se é a imagem principal
  index: number; // Índice da imagem (1-10)
  disabled?: boolean; // Estado desabilitado
}
```

**Funcionalidades**:

- Área clicável para seleção
- Preview da imagem selecionada
- Botão de remoção (hover)
- Botão "Definir como principal"
- Estados de loading
- Validações visuais

### Formulários de Loja

**Estados Principais**:

```typescript
const [nome, setNome] = useState("");
const [endereco, setEndereco] = useState("");
const [telefones, setTelefones] = useState<string[]>([""]);
const [imagens, setImagens] = useState<string[]>(Array(10).fill(""));
const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0);
const [loading, setLoading] = useState(false);
```

## Validações

### Frontend

```typescript
// Telefones
- Mínimo: 1 telefone
- Máximo: 5 telefones
- Formato: (99) 99999-9999 ou (99) 9999-9999

// Imagens
- Tipos aceitos: image/*
- Tamanho máximo: 5MB
- Formatos recomendados: PNG, JPG, JPEG

// Campos obrigatórios
- Nome da loja (mínimo 2 caracteres)
- Pelo menos 1 telefone válido
```

### Backend

```typescript
// Upload API
- Verificação de tipo MIME
- Limite de tamanho (5MB)
- Sanitização de nome de arquivo
- Criação de diretório seguro
```

## Estrutura de Uploads

### Diretório de Imagens

```
public/
└── uploads/
    └── lojas/
        ├── loja_1704067200000.jpg
        ├── loja_1704067300000.png
        └── ...
```

### Nomenclatura de Arquivos

```typescript
// Padrão: loja_[timestamp].[extensão]
const fileName = `loja_${Date.now()}.${extension}`;

// Exemplo
("loja_1704067200000.jpg");
```

### URLs Geradas

```typescript
// Padrão local
"/uploads/lojas/nome_do_arquivo.ext";

// Exemplo completo
"http://localhost:3000/uploads/lojas/loja_1704067200000.jpg";
```

## Fluxo de Operações

### Criação de Loja

1. Usuário acessa `/admin/lojas/nova`
2. Preenche dados básicos
3. Adiciona telefones (formatação automática)
4. Faz upload de imagens via `ImageUpload`
5. Define imagem principal
6. Submete formulário
7. Dados salvos no Supabase
8. Redirecionamento para listagem

### Edição de Loja

1. Usuário acessa `/admin/lojas/[id]/editar`
2. Sistema carrega dados existentes
3. Popula telefones e imagens
4. Usuário modifica dados necessários
5. Sistema detecta alterações
6. Atualização no Supabase
7. Feedback de sucesso

### Upload de Imagem

1. Usuário clica na área de upload
2. Seleciona arquivo do dispositivo
3. Validações frontend (tipo/tamanho)
4. Upload via FormData para `/api/upload`
5. Validações backend
6. Arquivo salvo em `public/uploads/lojas/`
7. URL retornada e atualizada no estado
8. Preview exibido na interface

## Status do Projeto

### ✅ Funcionalidades Implementadas

- [x] CRUD completo de lojas
- [x] Múltiplos telefones (até 5)
- [x] Upload real de imagens (até 10)
- [x] Sistema de imagem principal
- [x] Interface responsiva moderna
- [x] Validações frontend e backend
- [x] Sistema de busca integrado
- [x] Feedback visual (toasts, loading)
- [x] Formatação automática de telefones
- [x] Preview de imagens
- [x] Contadores e indicadores visuais

### 🚀 Tecnologias em Uso

- [x] Next.js 15.3.3 com Turbopack
- [x] TypeScript para tipagem
- [x] Tailwind CSS para estilos
- [x] Supabase PostgreSQL
- [x] Upload de arquivos nativo
- [x] Heroicons para ícones

### 📁 Estrutura Final

```
app/
├── api/
│   └── upload/
│       └── route.ts              # API genérica de upload
├── admin/
│   ├── lojas/
│   │   ├── page.tsx              # Listagem de lojas
│   │   ├── nova/page.tsx         # Criação de lojas
│   │   └── [id]/editar/page.tsx  # Edição de lojas
│   └── produtos/
│       └── novo/page.tsx         # Criação de produtos (corrigido)
components/
├── ImageUpload.tsx               # Upload para lojas (10 imagens)
└── ProductImageUpload.tsx        # Upload para produtos (4 imagens)
public/uploads/
├── lojas/                        # Imagens de lojas
└── produtos/                     # Imagens de produtos
```

## 🔧 Correções Implementadas

### Sistema de Upload Expandido

- **API Unificada**: Upload funciona para lojas e produtos via parâmetro `type`
- **Diretórios Separados**: `/uploads/lojas/` e `/uploads/produtos/`
- **Nomenclatura Específica**: `loja_timestamp.ext` e `produto_timestamp.ext`

### Página de Produtos Corrigida

- ✅ Substituído `ImageUpload` por `ProductImageUpload`
- ✅ Corrigidas tipagens de callbacks TypeScript
- ✅ Adicionada verificação de imagens no `handleCancel`
- ✅ Criado diretório específico `/uploads/produtos/`
- ✅ Removidos imports não utilizados

### Componentes de Upload

```typescript
// Para lojas (até 10 imagens)
<ImageUpload
  value={string}
  onChange={(url: string) => void}
  onSetAsPrincipal={() => void}
  isPrincipal={boolean}
  index={number}
/>

// Para produtos (até 4 imagens)
<ProductImageUpload
  images={string[]}
  principalIndex={number}
  onImagesChange={(images: string[], index: number) => void}
  onUploadError={(error: string) => void}
  onUploadSuccess={(message: string) => void}
/>
```

---

**Desenvolvido para TurattiMT**  
_Sistema completo de gerenciamento de lojas e produtos com upload de imagens_
