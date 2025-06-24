# Documentação - Sistema de Grid de Produtos TurattiMT

## Visão Geral

Sistema completo para exibição de produtos em formato grid com layout especial de 5.5 produtos (5 produtos completos + metade do 6º produto), utilizando a cor azul padrão do site (`bg-blue-600`).

## Componentes Implementados

### 1. API Pública de Produtos

**Arquivo:** `app/api/produtos/route.ts`

#### Endpoint Principal

```
GET /api/produtos
```

#### Parâmetros de Query Suportados:

- `subcategoria_id`: Filtrar por ID da subcategoria
- `categoria`: Filtrar por nome da categoria (busca parcial)
- `limite`: Limitar número de resultados (máx 50)
- `promocao`: true/false - Apenas produtos em promoção
- `novidade`: true/false - Apenas produtos novos

#### Exemplo de Uso:

```javascript
// Buscar 6 produtos em promoção
fetch("/api/produtos?promocao=true&limite=6");

// Buscar produtos de uma categoria específica
fetch("/api/produtos?categoria=tintas&limite=6");

// Buscar novidades
fetch("/api/produtos?novidade=true&limite=6");
```

#### Resposta da API:

```json
{
  "produtos": [
    {
      "id": 1,
      "nome": "Produto Exemplo",
      "preco": 99.99,
      "preco_formatado": "R$ 99,99",
      "promocao_mes": true,
      "preco_promocao": 79.99,
      "preco_promocao_formatado": "R$ 79,99",
      "novidade": false,
      "descricao": "Descrição do produto",
      "tipo_tinta": true,
      "cor_rgb": "#FF0000",
      "tipo_eletrico": false,
      "voltagem": null,
      "imagem_principal": "/uploads/produtos/produto_123.jpg",
      "imagem_principal_index": 0,
      "subcategoria": {
        "id": 1,
        "nome": "Subcategoria",
        "categorias": {
          "id": 1,
          "nome": "Categoria"
        }
      }
    }
  ],
  "total": 1,
  "filtros": {
    "subcategoria_id": null,
    "categoria": null,
    "limite": 6,
    "promocao": false,
    "novidade": false
  }
}
```

#### Características:

- **Cache:** 5 minutos (300 segundos)
- **Revalidação:** 10 minutos (600 segundos)
- **Apenas produtos ativos:** Filtro automático por status = "ativo"
- **Ordenação:** Por campo `ordem` (ascendente)
- **Formatação automática:** Preços formatados em Real brasileiro

### 2. Componente ProdutosGrid

**Arquivo:** `components/ProdutosGrid.tsx`

#### Props Interface:

```typescript
interface ProdutosGridProps {
  categoria?: string; // Filtrar por categoria
  subcategoria?: string; // Filtrar por subcategoria (ID)
  promocao?: boolean; // Apenas produtos em promoção
  novidade?: boolean; // Apenas produtos novos
  titulo?: string; // Título da seção
  className?: string; // Classes CSS adicionais
}
```

#### Layout Especial 5.5:

- **Grid:** 6 colunas (`grid-cols-6`)
- **5 produtos completos:** Nas primeiras 5 colunas
- **6º produto cortado:** Metade visível (`w-1/2`) com efeito de gradiente
- **Efeito visual:** Gradiente branco do lado direito para simular corte

#### Funcionalidades:

1. **Carregamento assíncrono** de produtos via API
2. **Estados de loading** com skeleton animado
3. **Tratamento de erro** com botão de retry
4. **Hover effects** com escala de imagem
5. **Badges dinâmicas** para promoção e novidade
6. **Preços formatados** com destaque para promoções
7. **Características visuais** para tintas (cor) e elétricos (voltagem)
8. **Botão "Ver Mais"** quando há mais de 5 produtos

#### Exemplo de Uso:

```jsx
// Grid básico
<ProdutosGrid titulo="Produtos em Destaque" />

// Grid de promoções
<ProdutosGrid
  promocao={true}
  titulo="🔥 Ofertas Especiais"
/>

// Grid de novidades
<ProdutosGrid
  novidade={true}
  titulo="✨ Lançamentos"
/>

// Grid por categoria
<ProdutosGrid
  categoria="tintas"
  titulo="Tintas Selecionadas"
/>
```

### 3. Página de Demonstração

**Arquivo:** `app/produtos-grid/page.tsx`

#### Seções Implementadas:

1. **Header:** Título e descrição da página
2. **Produtos em Destaque:** Grid geral
3. **Produtos em Promoção:** Filtro por promoção
4. **Novidades:** Filtro por novidade
5. **Seção informativa:** Benefícios da TurattiMT

#### Acesso:

```
http://localhost:3000/produtos-grid
```

## Design e Cores

### Paleta de Cores Utilizada:

- **Azul Principal:** `bg-blue-600` / `text-blue-600` (#2563eb)
- **Azul Hover:** `hover:bg-blue-700` (#1d4ed8)
- **Azul Claro:** `bg-blue-100` (#dbeafe)
- **Promoção:** `bg-orange-100` / `text-orange-800`
- **Novidade:** `bg-green-100` / `text-green-800`
- **Elétrico:** `bg-yellow-100` / `text-yellow-500`

### Responsividade:

- **Desktop:** Grid de 6 colunas
- **Tablet:** Grid adaptável (via Tailwind)
- **Mobile:** Grid responsivo (pode ajustar para menos colunas)

## Estrutura Técnica

### Dependências:

- **Next.js 14+** com App Router
- **React 18+** com Hooks
- **Tailwind CSS** para estilização
- **Heroicons** para ícones
- **Supabase** para dados

### Performance:

- **Cache de API:** 5 minutos
- **Lazy Loading:** Imagens carregadas sob demanda
- **Skeleton Loading:** Feedback visual durante carregamento
- **Otimização de Imagens:** Next.js Image component

### SEO e Acessibilidade:

- **Alt text** em todas as imagens
- **Structured markup** para produtos
- **Focus management** para navegação
- **ARIA labels** onde necessário

## Exemplos de Implementação

### 1. Homepage - Seção de Produtos:

```jsx
export default function HomePage() {
  return (
    <main>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ProdutosGrid
            titulo="🏆 Produtos em Destaque"
            promocao={true}
            className="mb-16"
          />
        </div>
      </section>
    </main>
  );
}
```

### 2. Página de Categoria:

```jsx
export default function CategoriaPage({ params }) {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <ProdutosGrid
          categoria={params.categoria}
          titulo={`Produtos de ${params.categoria}`}
        />
      </div>
    </div>
  );
}
```

### 3. Seção de Newsletter:

```jsx
export default function NewsletterSection() {
  return (
    <section className="bg-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-center text-3xl font-bold mb-8">
          Novidades Semanais
        </h2>
        <ProdutosGrid novidade={true} titulo="✨ Últimos Lançamentos" />
      </div>
    </section>
  );
}
```

## Customizações Disponíveis

### 1. Modificar Número de Produtos:

Para alterar o layout de 5.5 para outro formato, edite o grid:

```jsx
// Para 4.5 produtos
<div className="grid grid-cols-5 gap-4">
  {produtos.slice(0, 4).map(...)}
  {produtos[4] && <div className="overflow-hidden w-1/2">...
```

### 2. Alterar Cores:

Substituir classes de cor no componente:

```jsx
// Trocar azul por verde
<div className="text-lg font-bold text-green-600">
  {produto.preco_formatado}
</div>
```

### 3. Adicionar Filtros:

Estender a interface do componente:

```typescript
interface ProdutosGridProps {
  // ... props existentes
  precoMin?: number;
  precoMax?: number;
  marca?: string;
}
```

## Melhorias Futuras

### Funcionalidades Planejadas:

1. **Paginação:** Para grids com muitos produtos
2. **Filtros avançados:** Preço, marca, características
3. **Ordenação:** Por preço, nome, popularidade
4. **Wishlist:** Favoritar produtos
5. **Comparação:** Comparar produtos
6. **Zoom de imagem:** Visualização ampliada
7. **Variações:** Cores e tamanhos
8. **Avaliações:** Estrelas e comentários

### Otimizações Técnicas:

1. **Virtual scrolling** para muitos produtos
2. **Intersection Observer** para lazy loading
3. **Service Worker** para cache offline
4. **WebP images** para melhor performance
5. **CDN integration** para imagens
6. **Analytics tracking** para métricas

## Troubleshooting

### Problemas Comuns:

#### 1. Produtos não carregam:

- Verificar se a API está funcionando: `/api/produtos`
- Conferir logs do Supabase
- Validar filtros aplicados

#### 2. Imagens quebradas:

- Verificar URLs das imagens no banco
- Confirmar upload correto
- Testar fallback para ícone

#### 3. Layout quebrado:

- Verificar classes Tailwind
- Testar em diferentes resoluções
- Validar grid responsive

#### 4. Performance lenta:

- Verificar cache da API
- Otimizar tamanho das imagens
- Reduzir número de produtos carregados

## Conclusão

O sistema de Grid de Produtos oferece uma solução completa e elegante para exibição de produtos com:

- ✅ **Layout único 5.5** produtos
- ✅ **API robusta** com cache e filtros
- ✅ **Design responsivo** e moderno
- ✅ **Performance otimizada**
- ✅ **Fácil customização**
- ✅ **Código bem documentado**

O componente está pronto para uso em produção e pode ser facilmente integrado em qualquer página do site TurattiMT.
