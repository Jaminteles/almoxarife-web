# Arquitetura do Projeto - Sistema de Almoxarifado

## 🏗 Visão Geral

Este documento descreve a arquitetura, padrões e convenções utilizadas no projeto.

## 📐 Padrão de Arquitetura

### Pages (Páginas/Telas)
- Componentes que representam páginas/rotas completas
- Gerenciam estado local (useState)
- Contêm lógica de negócio dessa página
- Comunicam com a API (quando implementado)

### Components (Componentes Reutilizáveis)
- Componentes pequenos e focados em uma responsabilidade
- Recebem dados via props
- Não possuem estado próprio (stateless quando possível)
- Exemplos: BackButton, ListTemplate

### Layouts
- **MainLayout**: Layout principal com AppBar e Drawer (sidebar)
  - AppBar fixa no topo com título clicável (volta para Home)
  - Drawer permanente no desktop (lado esquerdo)
  - Drawer colapsável no mobile (abre/fecha com botão menu)
  - Conteúdo principal ocupa espaço restante, responsivo

## 🔄 Fluxo de Dados

```
App.js (com MainLayout)
  ↓
MainLayout (AppBar + Drawer responsivo)
  ├─ AppBar (fixo no topo)
  │  ├─ Menu button (mobile)
  │  └─ Título clicável (Home)
  ├─ Drawer Desktop (permanente, lado esquerdo)
  │  └─ NavigationMenu
  ├─ Drawer Mobile (colapsável)
  │  └─ NavigationMenu
  └─ Box Main (conteúdo dinâmico)
      └─ Routes (Home/Funcionários/Fornecedores)
```

## 🎯 Padrões Utilizados

### 1. Componentes de Página
```jsx
export default function PageName() {
  const navigate = useNavigate();
  
  // Estado local
  const [data, setData] = useState([]);
  
  // Handlers
  const handleAction = () => { };
  
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
}
```

### 2. Componentes Reutilizáveis
```jsx
export default function ComponentName({ prop1, prop2, onAction }) {
  return (
    <>
      {/* JSX */}
    </>
  );
}
```

### 3. Formulários
- Usar `useState` para gerenciar estado do formulário
- Estrutura: `[formState, setFormState] = useState({field: ""})`
- Usar `handleChange` para atualizar campos
- Submissão com `handleSubmit` que previne comportamento padrão

## 🎨 Estilo e Temas

- **MUI (Material-UI)**: Componentes visuais padrão
- **Tema Escuro**: Aplicado globalmente via `darkTheme`
- **Emotion**: Sistema CSS-in-JS do MUI
- **sx prop**: Usar para estilos inline em componentes MUI

## 🔐 Segurança (Considerações Futuras)

- [ ] Validação de entrada (CPF, CNPJ, email)
- [ ] Sanitização de dados
- [ ] Autenticação com tokens
- [ ] Proteção contra CSRF
- [ ] Hash de senhas no backend

## 🔌 Integração com API

### Padrão Proposto (TODO)

```jsx
// No formulário, substituir console.log por:
async function handleSubmit(e) {
  e.preventDefault();
  try {
    const response = await fetch('/api/funcionarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (response.ok) {
      navigate('/funcionarios');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

## 📦 Estado da Aplicação

### Tipos de Estado
1. **Estado Local**: useState em componentes específicos
2. **Estado Global**: (TODO) Adicionar Context API ou Redux se necessário
3. **Estado da URL**: via React Router

### Quando Adicionar Estado Global
- [ ] Dados compartilhados entre múltiplas páginas
- [ ] Informações de usuário autenticado
- [ ] Notificações globais

## ✅ Checklist de Desenvolvimento

### Ao Criar Uma Nova Page
- [ ] Criar pasta em `src/pages`
- [ ] Criar componente principal
- [ ] Adicionar rota em `App.js`
- [ ] Usar `useNavigate` para navegação
- [ ] Usar `BackButton` para voltar
- [ ] Atualizar esta documentação

### Ao Criar Um Novo Componente
- [ ] Criar arquivo em `src/components`
- [ ] Documentar props com comentários
- [ ] Testar com props diferentes
- [ ] Reutilizar em outros locais se apropriado

## 🧪 Testes (Estrutura Existente)

```
setupTests.js    # Configurações de teste
**/**.test.js    # Testes unitários
```

Padrão de teste (exemplo):
```javascript
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('deve renderizar', () => {
  render(<Component />);
  expect(screen.getByText('texto')).toBeInTheDocument();
});
```

## 📊 Diagrama de Componentes

```
App.js
  └── MainLayout
      ├── AppBar (fixo)
      │   ├── MenuButton (IconButton - mobile) 
      │   └── Título (Typography - clicável, vai para /)
      ├── Drawer (permanente - desktop)
      │   └── List
      │       ├── Funcionários
      │       └── Fornecedores
      ├── Drawer (temporário - mobile)
      │   └── List
      │       ├── Funcionários
      │       └── Fornecedores
      └── Box Main (conteúdo responsivo)
          └── Routes
              ├── Home
              ├── FuncionariosList
              │   ├── ListTemplate
              │   └── TextField (filtros)
              ├── FuncionarioForm
              │   ├── TextField (x6)
              │   └── Button
              ├── FornecedoresList
              │   ├── ListTemplate
              │   └── TextField (filtros)
              └── FornecedorForm
                  ├── TextField (x5)
                  └── Button
```

## 🚀 Performance

### Otimizações Implementadas
- [ ] Componentes memoizados (React.memo)
- [ ] Lazy loading de rotas
- [ ] Code splitting

### Próximas Melhorias
- Implementar lazy loading quando lista crescer
- Usar useMemo para cálculos pesados
- Implementar paginação nas listagens

## 📞 Suporte e Contribuição

Para dúvidas ou contribuições, revise:
- Este arquivo (ARCHITECTURE.md)
- README.md para instruções de setup
- Comentários no código

---

**Última atualização**: Abril 2026
**Versão**: 0.1.0
