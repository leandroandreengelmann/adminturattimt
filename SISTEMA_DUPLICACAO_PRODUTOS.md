# Sistema de Duplicação de Produtos - TurattiMT

## Visão Geral

Funcionalidade completa para duplicar produtos existentes, criando uma cópia exata com todas as informações, características e imagens, mas com nome único e algumas configurações resetadas.

## Localização

- **Arquivo**: `app/admin/produtos/page.tsx`
- **Função**: `handleDuplicate(produto: Produto)`
- **Botão**: Ícone verde de duplicar na coluna "Ações" da listagem

## Funcionalidades Implementadas

### 1. Duplicação Completa de Dados

- ✅ **Todos os campos copiados**: Nome, preço, descrição, subcategoria, características
- ✅ **Configurações especiais**: Tipo tinta (com cor), tipo elétrico (com voltagem)
- ✅ **Metadados**: Ordem, status, timestamps atualizados

### 2. Sistema de Nomes Únicos

- ✅ **Nome base**: `[Nome Original] - Cópia`
- ✅ **Verificação de duplicatas**: Se já existe, adiciona numeração
- ✅ **Sequência automática**: `Cópia`, `Cópia 2`, `Cópia 3`, etc.
- ✅ **Consulta no banco**: Verifica existência antes de criar

### 3. Duplicação de Imagens

- ✅ **Download das originais**: Busca imagens do Supabase Storage
- ✅ **Upload de novas cópias**: Cria arquivos únicos no storage
- ✅ **Nomenclatura única**: `produto_[timestamp]_[random].[ext]`
- ✅ **Preservação de qualidade**: Mantém formato e resolução originais
- ✅ **Índice da principal**: Mantém qual imagem é a principal

### 4. Configurações Resetadas

- ✅ **Promoção**: Desabilitada (promocao_mes = false)
- ✅ **Novidade**: Desabilitada (novidade = false)
- ✅ **Status**: Sempre "ativo"
- ✅ **Timestamps**: created_at e updated_at atualizados

## Interface do Usuário

### Botão de Duplicação

- **Localização**: Coluna "Ações" na listagem de produtos
- **Ícone**: DocumentDuplicateIcon (verde)
- **Posição**: Entre "Editar" (azul) e "Excluir" (vermelho)
- **Tooltip**: "Duplicar produto"

### Confirmação

- **Modal**: Pergunta de confirmação antes de duplicar
- **Mensagem**: Informa que será criada cópia completa com imagens
- **Opções**: "OK" para confirmar ou "Cancelar"

### Feedback Visual

- **Toast de progresso**: "Duplicando Produto - Criando cópia de [Nome]..."
- **Toast de sucesso**: "Produto Duplicado - [Nome] foi criado com sucesso! X imagens copiadas."
- **Toast de erro**: Mensagens específicas em caso de falha

## Fluxo de Funcionamento

### 1. Iniciação

```
Listagem → Clique no botão verde → Confirmação → Duplicação
```

### 2. Processo de Duplicação

1. **Verificação de autenticação**
2. **Geração de nome único**
3. **Download e upload de imagens**
4. **Criação do registro no banco**
5. **Atualização da listagem**

### 3. Tratamento de Imagens

```javascript
Para cada imagem do produto original:
1. Verificar se existe e é do Supabase
2. Fazer download da imagem (fetch)
3. Gerar novo nome único
4. Upload para storage com novo nome
5. Obter URL pública da nova imagem
6. Adicionar ao array de imagens duplicadas
```

## Dados Copiados vs Resetados

### ✅ Campos Copiados (Mantidos)

- `nome` - Com sufixo " - Cópia"
- `preco` - Preço original
- `descricao` - Descrição completa
- `subcategoria_id` - Mesma categoria
- `tipo_tinta` - Flag de tinta
- `cor_rgb` - Cor da tinta (se aplicável)
- `tipo_eletrico` - Flag de elétrico
- `voltagem` - Voltagem (se aplicável)
- `ordem` - Mesma ordem
- `imagem_*` - Todas as 4 imagens (duplicadas)
- `imagem_principal_index` - Índice da principal

### 🔄 Campos Resetados (Novos Valores)

- `promocao_mes` → `false`
- `preco_promocao` → `null`
- `promocao_data_inicio` → `null`
- `promocao_data_fim` → `null`
- `promocao_duracao_dias` → `null`
- `promocao_status` → `null`
- `novidade` → `false`
- `status` → `"ativo"`
- `created_at` → Data/hora atual
- `updated_at` → Data/hora atual

## Tratamento de Erros

### Autenticação

- Verifica se usuário está logado
- Mensagem específica se não autenticado

### Duplicação de Imagens

- **Falha no download**: Continua sem a imagem
- **Falha no upload**: Log de aviso, continua processo
- **Imagem não encontrada**: Ignora e continua

### Inserção no Banco

- **Nome duplicado**: Sistema gera nome único automaticamente
- **Erro de permissão**: Mensagem específica de RLS
- **Erro de validação**: Mensagem detalhada do erro

## Logs de Debug

### Console Logs Implementados

- 📋 Dados do produto duplicado
- ✅ Imagem X duplicada: [URL]
- ⚠️ Erro ao duplicar imagem X: [erro]
- ⚠️ Erro ao processar imagem X: [erro]
- ❌ Erro ao inserir produto duplicado: [erro]

### Informações Registradas

- Nome único gerado
- URLs das imagens duplicadas
- Quantidade de imagens copiadas
- Dados completos do produto criado

## Integração com Sistema

### Políticas RLS

- Usa as mesmas políticas de INSERT da criação
- Requer usuário autenticado
- Herda permissões do sistema existente

### Storage de Imagens

- Utiliza bucket "images" existente
- Pasta "produtos/" para organização
- Nomenclatura consistente com sistema

### Atualização da Interface

- Recarrega listagem automaticamente após duplicação
- Produto duplicado aparece no topo (mais recente)
- Mantém filtros aplicados na listagem

## Casos de Uso

### 1. Produtos Similares

- Duplicar produto base
- Alterar apenas nome e algumas características
- Economiza tempo de cadastro

### 2. Variações de Produto

- Duplicar produto principal
- Modificar voltagem, cor ou especificações
- Manter mesma categoria e descrição base

### 3. Backup de Configuração

- Duplicar antes de grandes alterações
- Manter versão original como backup
- Facilita reversão se necessário

## Exemplo de Uso

### Cenário: Duplicar "Furadeira Bosch 500W"

1. **Clique no botão verde** na linha do produto
2. **Confirme** a duplicação no modal
3. **Sistema cria**: "Furadeira Bosch 500W - Cópia"
4. **Imagens copiadas**: Todas as 4 imagens duplicadas no storage
5. **Resultado**: Produto idêntico, pronto para edição

### Nome Único Automático

- Se "Furadeira Bosch 500W - Cópia" já existe
- Sistema cria "Furadeira Bosch 500W - Cópia 2"
- Se também existe, cria "Furadeira Bosch 500W - Cópia 3"
- E assim por diante...

## Status do Sistema

- ✅ **Funcional**: Sistema 100% operacional
- ✅ **Testado**: Duplicação completa implementada
- ✅ **Integrado**: Conectado com listagem e storage
- ✅ **Documentado**: Guia completo disponível

## Benefícios

### Para o Usuário

- **Economia de tempo**: Não precisa recriar produtos similares
- **Consistência**: Mantém padrões e configurações
- **Facilidade**: Um clique para duplicar tudo

### Para o Sistema

- **Integridade**: Nomes únicos garantidos
- **Organização**: Imagens organizadas no storage
- **Rastreabilidade**: Logs completos de operações

---

**Desenvolvido para TurattiMT** - Sistema completo de gerenciamento de produtos
**Data**: Janeiro 2025
**Status**: Pronto para uso
