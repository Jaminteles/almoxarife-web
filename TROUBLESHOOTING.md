# 🔧 Troubleshooting e FAQ

## 🚨 Erros Comuns

### ❌ Erro: \"Cannot find module '@mui/material'\"

**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

---

### ❌ Erro: \"useNavigate is not defined\"

**Causa**: Hook de roteamento usado sem o contexto correto

```jsx
// ❌ ERRADO
import { useNavigate } from "react-router-dom";

export default function Component() {
  const navigate = useNavigate();  // Erro: sem BrowserRouter
  return <button onClick={() => navigate('/')}>Home</button>;
}
```

**Solução**: Usar dentro do `BrowserRouter` (já configurado em App.js)

```jsx
// ✅ CORRETO
// Em App.js já existe BrowserRouter envolvendo tudo
// Componentes dentro de Routes podem usar useNavigate
```

---

### ❌ Erro: \"Missing filename extension .jsx\"

**Causa**: Importação sem extensão em alguns casos

```javascript
// ❌ Pode falhar
import Component from "./Component";

// ✅ Melhor
import Component from "./Component.jsx";
```

---

### ❌ Erro: \"Infinite re-renders\"

**Causa**: useState com função/objeto como inicializador

```jsx
// ❌ ERRADO - recria objeto a cada render
const [state, setState] = useState({
  dados: fetchData()  // Função chamada a cada render!
});

// ✅ CORRETO - usar useEffect
const [state, setState] = useState({ dados: [] });
useEffect(() => {
  setState({ dados: fetchData() });
}, []);
```

---

### ❌ Erro: \"Lists should have a key prop\"

**Causa**: Rendering de lista sem propriedade `key`

```jsx
// ❌ ERRADO
{data.map(item => (
  <div>{item.nome}</div>
))}

// ✅ CORRETO
{data.map(item => (
  <div key={item.id}>{item.nome}</div>
))}
```

---

### ❌ Erro: \"Uncaught ReferenceError: Document is not defined\"

**Causa**: Código rodando no servidor (SSR) em vez do cliente

**Solução**: Verificar se código está em componente React que roda no navegador

---

## 🤔 FAQ

### P: Como adiciono um novo campo no formulário?

**R**:

1. Adicione ao estado inicial:
```jsx
const [form, setForm] = useState({
  nome: "",
  email: "",
  novocampo: ""  // ← Novo
});
```

2. Adicione o TextField:
```jsx
<TextField 
  name="novocamp" 
  label="Novo Campo" 
  onChange={handleChange} 
  required 
/>
```

3. O `handleChange` já funciona automaticamente!

---

### P: Como modifico as cores do tema?

**R**: Edite `App.js`:

```jsx
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",  // Cor primária
    },
    secondary: {
      main: "#dc004e",  // Cor secundária
    },
  },
});
```

---

### P: Como adiciono uma nova página/rota?

**R**:

1. Crie o arquivo: `src/pages/minha-pagina.jsx`

```jsx
export default function MinhaPage() {
  const navigate = useNavigate();
  
  return (
    <Container>
      <h1>Minha Página</h1>
    </Container>
  );
}
```

2. Importe em `App.js`:
```jsx
import MinhaPage from "./pages/minha-pagina";
```

3. Adicione a rota:
```jsx
<Route path="/minha-pagina" element={<MinhaPage />} />
```

---

### P: Como redirecionei o usuário?

**R**: Use `useNavigate`:

```jsx
import { useNavigate } from "react-router-dom";

export default function Component() {
  const navigate = useNavigate();
  
  function handleClick() {
    navigate("/destino");  // Rota absoluta
    navigate(-1);          // Voltar
    navigate(-2);          // Voltar 2 páginas
  }
  
  return <button onClick={handleClick}>Ir</button>;
}
```

---

### P: Como importei um componente do MUI?

**R**:

```jsx
// Importar múltiplos componentes de uma vez
import { Button, TextField, Container, Box } from "@mui/material";

// Depois use:
<Button variant="contained">Clique</Button>
<TextField label="Campo" />
<Container>Conteúdo</Container>
<Box sx={{ p: 2 }}>Caixa</Box>
```

---

### P: Como posso debugar minha aplicação?

**R**:

1. **Console do navegador** (F12):
   - Ver logs, erros e warnings
   - Inspecionar elementos

2. **React DevTools** (extensão do navegador):
   - Visualizar componentes
   - Ver props e state
   - Rerender com diferentes estados

3. **debugger no código**:
```jsx
function handleSubmit() {
  debugger;  // Pausa aqui no DevTools
  console.log("Dados:", form);
}
```

---

### P: Como valido os dados antes de enviar?

**R**:

```jsx
function validateForm(form) {
  const errors = {};
  
  if (!form.nome || form.nome.length < 3) {
    errors.nome = "Nome deve ter no mínimo 3 caracteres";
  }
  
  if (!form.email.includes("@")) {
    errors.email = "Email inválido";
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}

function handleSubmit(e) {
  e.preventDefault();
  
  const erros = validateForm(form);
  if (erros) {
    alert(Object.values(erros).join(", "));
    return;
  }
  
  // Enviar dados
}
```

---

### P: Como crio um componente reutilizável?

**R**: Crie em `src/components/`:

```jsx
// src/components/StatusBadge.jsx
import { Chip } from "@mui/material";

/**
 * Badge de status
 * @param {string} status - Status do item (ativo, inativo, pendente)
 * @param {function} onDelete - Callback ao deletar
 */
export default function StatusBadge({ status, onDelete }) {
  const colors = {
    ativo: "success",
    inativo: "error",
    pendente: "warning"
  };
  
  return (
    <Chip 
      label={status} 
      color={colors[status]} 
      onDelete={onDelete}
    />
  );
}
```

**Uso**:
```jsx
import StatusBadge from "../../components/StatusBadge";

<StatusBadge status="ativo" onDelete={() => console.log("deletado")} />
```

---

## 📊 Dicas de Performance

### ❌ Evite re-renders desnecessários:

```jsx
// ❌ Função criada a cada render
<button onClick={() => handleClick(item)}>
  
// ✅ Use useCallback
const handleClickWrapped = useCallback((item) => {
  handleClick(item);
}, []);

<button onClick={() => handleClickWrapped(item)}>
```

---

### ❌ Evite computações pesadas:

```jsx
// ❌ Recalcula a cada render
const resultado = dados.map(x => x.valor).reduce((a,b) => a+b, 0);

// ✅ Use useMemo
const resultado = useMemo(() => {
  return dados.map(x => x.valor).reduce((a,b) => a+b, 0);
}, [dados]);
```

---

## 🧪 Testes Rápidos

### Testar componente isolado
```bash
npm test -- --watchAll=false --testPathPattern=BackButton
```

---

## 📞 Quando Pedir Ajuda

**Verifique antes**:
- [ ] As dependências estão instaladas (`npm install`)?
- [ ] O servidor está rodando (`npm start`)?
- [ ] Há erros no console (F12 → Console)?
- [ ] O arquivo está salvo?
- [ ] A rota existe em App.js?

**Se ainda houver problema**:
1. Copie a mensagem de erro exata
2. Procure no Google ou StackOverflow
3. Revise este guia de Troubleshooting
4. Procure em ARCHITECTURE.md ou DEVELOPMENT.md

---

## 🔗 Recursos Úteis

- [React Documentation](https://react.dev)
- [Material-UI Components](https://mui.com/material-ui/api/)
- [React Router Docs](https://reactrouter.com/en/main)
- [MDN Web Docs](https://developer.mozilla.org)
- [Can I Use](https://caniuse.com)

---

## 📝 Checklist para Deploy

Antes de colocar em produção:

- [ ] Remover `console.log` do código
- [ ] Testar em modo production: `npm run build`
- [ ] Validação de entrada implementada
- [ ] Tratamento de erros em chamadas API
- [ ] Variáveis de ambiente configuradas
- [ ] Build sem warnings
- [ ] HTTPS ativado
- [ ] Cache configurado

---

**Última atualização**: Abril 2026
**Versão**: 0.1.0
