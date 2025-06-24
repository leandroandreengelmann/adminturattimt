# Sistema de Edição de Imagens de Produtos - TurattiMT

## Funcionalidades Implementadas

### 1. **Visualização das Imagens Atuais**

- Carrega e exibe todas as imagens (principal, 2ª, 3ª e 4ª) do produto
- Mostra qual imagem está definida como principal (com ícone de estrela)
- Preview em tempo real das imagens carregadas

### 2. **Upload de Novas Imagens**

- Sistema de upload com drag-and-drop ou clique para selecionar
- Validação automática de tipo de arquivo (apenas imagens)
- Validação de tamanho (máximo 5MB por imagem)
- Feedback visual durante o upload (loading)
- Mensagens de sucesso/erro através do sistema de toast

### 3. **Edição da Galeria**

- **Adicionar imagens**: Upload para slots vazios (até 4 imagens total)
- **Substituir imagens**: Upload sobre imagem existente para substituí-la
- **Remover imagens**: Botão X para deletar imagem específica
- **Definir imagem principal**: Botão para escolher qual imagem será a principal

### 4. **Gerenciamento da Imagem Principal**

- Sistema inteligente que ajusta automaticamente o índice da imagem principal
- Se a imagem principal for removida, a primeira imagem disponível vira principal
- Indicação visual clara de qual é a imagem principal

### 5. **Integração com Banco de Dados**

- Salva automaticamente todas as URLs das imagens nos campos:
  - `imagem_principal` (slot 1)
  - `imagem_2` (slot 2)
  - `imagem_3` (slot 3)
  - `imagem_4` (slot 4)
- Salva o índice da imagem principal em `imagem_principal_index`

### 6. **Detecção de Alterações**

- Sistema compara imagens originais vs atuais
- Detecta mudanças nas URLs das imagens
- Detecta mudanças no índice da imagem principal
- Habilita/desabilita botão "Salvar" baseado nas alterações

## Estrutura Técnica

### **Componente Utilizado**

- `ProductImageUpload.tsx` - Componente reutilizável para upload de imagens

### **Props do Componente**

```typescript
interface ProductImageUploadProps {
  images: string[]; // Array com 4 URLs das imagens
  principalIndex: number; // Índice da imagem principal (0-3)
  onImagesChange: (newImages: string[], newPrincipalIndex: number) => void;
  onUploadError: (error: string) => void;
  onUploadSuccess: (message: string) => void;
  disabled?: boolean; // Para desabilitar durante salvamento
}
```

### **Estados Gerenciados**

```typescript
const [imagens, setImagens] = useState<string[]>(["", "", "", ""]);
const [imagemPrincipalIndex, setImagemPrincipalIndex] = useState(0);
```

### **API de Upload**

- Endpoint: `/api/upload`
- Tipo: `produtos`
- Salva em: `/public/uploads/produtos/`
- Formato do nome: `produto_timestamp.ext`

## Fluxo de Uso

### **Para o Usuário:**

1. Acessa a página de edição do produto
2. Vê as imagens atuais na seção "Galeria de Imagens"
3. Pode:
   - Clicar em slot vazio para adicionar nova imagem
   - Clicar no X para remover imagem existente
   - Clicar em "Definir como Principal" para trocar a imagem principal
   - Fazer upload de nova imagem para substituir existente
4. Salva as alterações com o botão "Salvar Alterações"

### **Validações Automáticas:**

- ✅ Apenas arquivos de imagem (PNG, JPG, JPEG)
- ✅ Tamanho máximo 5MB por arquivo
- ✅ Feedback visual durante upload
- ✅ Detecção automática de alterações
- ✅ Gerenciamento inteligente da imagem principal

## Benefícios do Sistema

1. **Interface Intuitiva**: Visual claro e simples de usar
2. **Validação Robusta**: Previne erros de upload
3. **Feedback Imediato**: Usuário sabe o status das operações
4. **Flexibilidade Total**: Pode adicionar, remover e reordenar conforme necessário
5. **Integração Completa**: Funciona perfeitamente com o sistema existente
6. **Performance Otimizada**: Upload individual evita travamentos

## Tecnologias Utilizadas

- **React** com TypeScript
- **Tailwind CSS** para estilização
- **Heroicons** para ícones
- **Next.js API Routes** para upload
- **Supabase** para persistência no banco
- **Sistema de Toast** para feedback ao usuário

---

**Status: ✅ IMPLEMENTADO E FUNCIONAL**  
**Data: Janeiro 2025**  
**Versão: 1.0**
