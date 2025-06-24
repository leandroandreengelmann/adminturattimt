# Modais de Confirmação Personalizados - TurattiMT

## 📋 Visão Geral

Substituímos os alertas padrão do navegador (`confirm()`, `alert()`) por modais personalizados e elegantes que seguem o design system do projeto.

## 🎨 Características dos Modais

### ✨ Design Moderno

- **Interface elegante** com animações suaves
- **Ícones contextuais** para cada tipo de ação
- **Cores temáticas** baseadas no tipo de ação
- **Responsivo** e acessível

### 🔧 Tipos de Modal Disponíveis

#### 1. **Delete (Excluir)**

- **Cor**: Vermelho
- **Ícone**: Lixeira
- **Uso**: Confirmação de exclusão de produtos

#### 2. **Duplicate (Duplicar)**

- **Cor**: Verde
- **Ícone**: Documento duplicado
- **Uso**: Confirmação de duplicação de produtos

#### 3. **Info (Informação)**

- **Cor**: Azul
- **Ícone**: Círculo de informação
- **Uso**: Avisos informativos

#### 4. **Warning (Aviso)**

- **Cor**: Amarelo
- **Ícone**: Triângulo de exclamação
- **Uso**: Avisos gerais

## 🚀 Como Usar

### 1. Importar o Hook

```typescript
import { useConfirmModal } from "@/hooks/useConfirmModal";
```

### 2. Usar no Componente

```typescript
const { showConfirm, ConfirmModalComponent } = useConfirmModal();

// No JSX
return (
  <>
    {ConfirmModalComponent}
    {/* Resto do componente */}
  </>
);
```

### 3. Chamar o Modal

```typescript
const handleDelete = async () => {
  const confirmed = await showConfirm({
    title: "Excluir Produto",
    message:
      "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.",
    type: "delete",
    confirmText: "Excluir",
    cancelText: "Cancelar",
  });

  if (confirmed) {
    // Executar ação de exclusão
  }
};
```

## 📱 Implementação na Página de Produtos

### Antes (Alert Padrão)

```javascript
if (!confirm("Tem certeza que deseja excluir?")) {
  return;
}
```

### Depois (Modal Personalizado)

```typescript
const confirmed = await showConfirm({
  title: "Excluir Produto",
  message: `Tem certeza que deseja excluir o produto "${produto.nome}"? Esta ação não pode ser desfeita.`,
  type: "delete",
  confirmText: "Excluir",
  cancelText: "Cancelar",
});

if (!confirmed) {
  return;
}
```

## 🎯 Vantagens dos Modais Personalizados

### ✅ **Experiência do Usuário**

- Interface consistente com o design do sistema
- Animações suaves e profissionais
- Melhor legibilidade e clareza

### ✅ **Funcionalidade**

- Suporte a async/await
- Tipagem TypeScript completa
- Fácil personalização

### ✅ **Acessibilidade**

- Suporte a teclado
- Foco automático
- Escape para fechar

### ✅ **Responsividade**

- Funciona em todas as telas
- Layout adaptativo
- Touch-friendly

## 🔧 Tecnologias Utilizadas

- **Headless UI**: Para acessibilidade e comportamento
- **Tailwind CSS**: Para estilização
- **Heroicons**: Para ícones
- **TypeScript**: Para tipagem
- **React Hooks**: Para gerenciamento de estado

## 📦 Arquivos Criados

1. **`components/ConfirmModal.tsx`** - Componente do modal
2. **`hooks/useConfirmModal.tsx`** - Hook para gerenciar modais
3. **Atualização em `app/admin/produtos/page.tsx`** - Implementação

## 🎨 Resultado Visual

Os modais agora têm:

- **Fundo escurecido** com overlay
- **Animação de entrada/saída** suave
- **Ícones coloridos** contextuais
- **Botões estilizados** com hover effects
- **Layout centralizado** e responsivo

## 🚀 Status

✅ **Implementado e Funcional**

- Modais de exclusão personalizados
- Modais de duplicação personalizados
- Hook reutilizável criado
- Integração completa na página de produtos

Os avisos agora são **profissionais, elegantes e consistentes** com o design do sistema TurattiMT!
