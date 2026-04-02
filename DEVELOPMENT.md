# 📚 Guia de Desenvolvimento - Sistema de Almoxarifado

## 🎯 Objetivo

Este guia estabelece padrões, convenções e boas práticas para desenvolvimento consistente no projeto.

## 📝 Convenções de Código

### Nomenclatura

#### Arquivos e Pastas
```
✅ src/pages/funcionarios/List.jsx
✅ src/components/BackButton.jsx
❌ src/pages/funcionários/list.jsx
❌ src/components/back-button.jsx
```
- PascalCase para componentes React (.jsx)
- camelCase para pastas
- Nomes descritivos e em inglês

#### Variáveis e Funções
```javascript
✅ const userName = "João";
✅ function handleFormSubmit(e) { }
✅ const [isLoading, setIsLoading] = useState(false);

❌ const name = "João";  // Ambíguo
❌ const onSubmit = (e) => { }  // Não segue padrão handle
```

- camelCase para variáveis
- Prefixo `handle` para event handlers
- Prefixo `is` ou `has` para booleanos

#### Componentes
```javascript
✅ export default function FuncionariosList() { }
✅ export default function FuncionarioForm() { }

❌ export default function Funcionarios() { }  // Ambíguo
❌ export default (props) => { }  // Sem nome
```

- PascalCase
- Nomes no singular ou plural claro (Form, List, Item)
- Sempre exportar como named ou default com nome

### Estrutura de Componente

```jsx
import { useState } from "react";
import { Container, /* outros imports */ } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

/**
 * Descrição do componente
 * @returns {JSX.Element} Componente renderizado
 */
export default function ComponentName() {
  // 1. Hooks (useState, useEffect, etc)
  const navigate = useNavigate();
  const [state, setState] = useState(initialValue);

  // 2. Estado computado (variáveis derivadas)
  const isValid = state.length > 0;

  // 3. Handlers
  function handleSubmit(e) {
    e.preventDefault();
    // lógica
  }

  // 4. Effects (useEffect) - se necessário

  // 5. Render
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
}
```

## 🏗 Estrutura de Pastas

```
src/
├── pages/                  # Páginas completas (conectadas a rotas)
│   ├── home.jsx           # Página inicial
│   ├── funcionarios/       # Recursos funcionários
│   │   ├── List.jsx       # Listagem
│   │   └── Form.jsx       # Formulário CRUD
│   └── fornecedores/       # Recursos fornecedores
│       ├── List.jsx       # Listagem
│       └── Form.jsx       # Formulário CRUD
├── components/            # Componentes reutilizáveis
│   ├── BackButton.jsx     # Botão de voltar
│   └── ListTemplate.jsx   # Template de listagems
├── layouts/              # Layouts estruturais
│   └── MainLayout.jsx    # Layout principal (se necessário)
├── hooks/                # Custom hooks (futuro)
│   └── useForm.js        # Ex: hook customizado para formulários
├── utils/                # Utilitários (futuro)
│   ├── validators.js     # Validações
│   └── formatters.js     # Formatações
├── services/             # Serviços (futuro)
│   └── api.js           # Chamadas à API
├── App.js               # Arquivo principal com rotas
├── App.css              # Estilos globais
└── index.js             # Entry point
```

## 📋 Padrões Específicos

### Formulário
```jsx
const [form, setForm] = useState({
  nome: "",
  email: "",
  cpf: ""
});

function handleChange(e) {
  setForm({
    ...form,
    [e.target.name]: e.target.value
  });
}

function handleSubmit(e) {
  e.preventDefault();
  // TODO: Validar antes de enviar
  // TODO: Enviar para API
  console.log("Dados:", form);
  navigate("/anterior");
}
```

### Listagem com Filtros
```jsx
const data = [
  { nome: "João", cpf: "123", email: "joao@email.com", cargo: "Almoxarife" }
];

<ListTemplate
  title="Funcionários"
  columns={["Nome", "CPF", "Email", "Cargo"]}
  data={data}
  onCreate={() => navigate("/funcionarios/novo")}
  filters={
    <>
      <TextField label="Nome" size="small" />
      <TextField label="CPF" size="small" />
    </>
  }
/>
```

## 🎨 Estilização (Material-UI)

### Usando sx prop (preferido)
```jsx
<Box
  sx={{
    display: "flex",
    gap: 2,
    mb: 3,
    p: 2,
    borderRadius: 2
  }}
>
  {/* conteúdo */}
</Box>
```

### Estilos em CSS (App.css)
```css
/* Use apenas para estilos globais */
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}
```

### Evitar CSS Modules neste projeto
O MUI `sx` e CSS global são suficientes.

## ✅ Validação de Dados

### Padrão Sugerido (implementar)
```jsx
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateCPF(cpf) {
  // Implementar validação real de CPF
  return cpf.length === 11;
}

function handleSubmit(e) {
  e.preventDefault();
  
  if (!validateEmail(form.email)) {
    alert("Email inválido");
    return;
  }
  
  if (!validateCPF(form.cpf)) {
    alert("CPF inválido");
    return;
  }
  
  // Enviar dados
}
```

## 🔗 Integração com API (Próximo Passo)

### Estrutura Recomendada
```
src/services/api.js
```

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

export async function createFuncionario(data) {
  const response = await fetch(`${API_BASE_URL}/funcionarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function getFuncionarios() {
  const response = await fetch(`${API_BASE_URL}/funcionarios`);
  return response.json();
}
```

### Uso em Componentes
```jsx
import { createFuncionario } from "../../services/api";

async function handleSubmit(e) {
  e.preventDefault();
  
  try {
    const result = await createFuncionario(form);
    navigate("/funcionarios");
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar funcionário");
  }
}
```

## 🧪 Teste Básico (usar setupTests.js)

```javascript
// src/components/BackButton.test.js
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BackButton from './BackButton';

test('deve renderizar botão com texto "Voltar"', () => {
  render(
    <BrowserRouter>
      <BackButton />
    </BrowserRouter>
  );
  expect(screen.getByText('Voltar')).toBeInTheDocument();
});
```

## 📱 Responsividade

Material-UI já traz responsividade. Use breakpoints:
```jsx
<Box
  sx={{
    display: "flex",
    flexDirection: { xs: 'column', sm: 'row' },
    gap: { xs: 1, md: 3 }
  }}
>
```

## 🎯 Checklist de Código

Antes de commitar:
- [ ] Sem `console.log` em produção (comentar ou remover)
- [ ] Sem erros no console
- [ ] Funções nomeadas corretamente
- [ ] Props documentadas em componentes reutilizáveis
- [ ] Elementos com `key` em listas
- [ ] Sem código duplicado (refatorar em componentes)
- [ ] Estilos via MUI `sx` quando possível
- [ ] Imports organizados (React, bibliotecas, componentes, utilitários)

## 🚫 Erros Comuns

### ❌ Props não validadas
```javascript
// Evitar
export default function Item(props) {
  return <div>{props.name}</div>;
}
```

### ✅ Props claros
```javascript
// Preferir
export default function Item({ name, email }) {
  return <div>{name} - {email}</div>;
}
```

### ❌ Estado desnecessário
```javascript
function Component({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  return <div>{value}</div>;
}
```

### ✅ Usar props diretamente se não mudar
```javascript
function Component({ value }) {
  return <div>{value}</div>;
}
```

## 📞 Recursos

- [React Docs](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [React Router Docs](https://reactrouter.com)

---

**Última atualização**: Abril 2026
**Versão**: 0.1.0
