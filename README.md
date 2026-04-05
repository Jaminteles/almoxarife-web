# Sistema de Almoxarifado Web

Sistema de gerenciamento de recursos humanos e fornecedores para almoxarifado.

## 📋 Sobre o Projeto

Aplicação web desenvolvida em **React** para gerenciar:
- **Funcionários**: cadastro, edição e listagem de colaboradores
- **Fornecedores**: cadastro, edição e listagem de fornecedores

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado (versão 14+)
- npm ou yarn

### Instalação e Execução

1. Abra o terminal na pasta do projeto
2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

### Instalar Dependências Manualmente (opcional)

```bash
npm install react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

## 📁 Estrutura do Projeto

```
src/
├── pages/                 # Páginas/telas do sistema
│   ├── home.jsx          # Página inicial 
│   ├── funcionarios/
│   │   ├── List.jsx      # Lista de funcionários
│   │   └── Form.jsx      # Formulário de cadastro/edição
│   └── fornecedores/
│       ├── List.jsx      # Lista de fornecedores
│       └── Form.jsx      # Formulário de cadastro/edição
├── components/           # Componentes reutilizáveis
│   ├── BackButton.jsx    # Botão de voltar
│   └── ListTemplate.jsx  # Template para listagens
├── layouts/             # Layouts estruturais
│   └── MainLayout.jsx   # Layout principal com AppBar e Drawer
├── App.js               # Configuração de rotas e tema
├── App.css              # Estilos globais
└── index.js             # Ponto de entrada
```

## 🎨 Layout Principal

O projeto utiliza **MainLayout** que oferece:
- **AppBar Fixa**: Título clicável (volta para Home) + Botão menu no mobile
- **Drawer Permanente** (Desktop): Menu lateral esquerdo sempre visível
- **Drawer Colapsável** (Mobile): Menu lateral que aparece ao clicar no ☰
- **Responsividade**: Conteúdo adapta automaticamente para mobile/tablet/desktop

## 🔗 Rotas da Aplicação

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Home | Página inicial com menu |
| `/funcionarios` | FuncionariosList | Lista de funcionários |
| `/funcionarios/novo` | FuncionarioForm | Cadastro de novo funcionário |
| `/fornecedores` | FornecedoresList | Lista de fornecedores |
| `/fornecedores/novo` | FornecedorForm | Cadastro de novo fornecedor |

## 💾 Dados dos Modelos

### Funcionário
```javascript
{
  nome: string,       // Nome completo
  cpf: string,        // CPF
  email: string,      // Email
  cargo: string,      // Cargo/função
  login: string,      // Usuário para login
  senha: string       // Senha criptografada
}
```

### Fornecedor
```javascript
{
  nome: string,       // Razão social
  cnpj: string,       // CNPJ
  telefone: string,   // Telefone
  email: string,      // Email
  endereco: string    // Endereço completo
}
```

## 🎨 Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 19.2.4 | Framework principal |
| React Router | 7.13.2 | Roteamento de páginas |
| Material-UI (MUI) | 7.3.9 | Componentes visuais |
| Emotion | 11.14.0+ | Estilização CSS-in-JS |

### Backend
| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 14+ | Runtime JavaScript |
| Express | 4.18.2 | Framework web |
| CORS | 2.8.5 | Controle de acesso |
| bcrypt | 5.1.1 | Hash de senhas |
| UUID | 9.0.0 | Geração de IDs únicos |
| Nodemon | 3.0.0 | Reload automático (dev) |

## 📝 Scripts Disponíveis

### Frontend
```bash
npm start        # Inicia servidor de desenvolvimento (porta 3000)
npm run build    # Cria build otimizado para produção
npm test         # Executa testes
npm run eject    # Expõe configurações (irreversível)
```

### Backend
```bash
cd backend
npm install      # Instala dependências do backend
npm start        # Inicia servidor (porta 5000)
npm run dev      # Inicia com nodemon (reload automático)
```

## 🔧 Componentes Principais

### BackButton
Botão reutilizável para navegação volta.
```jsx
<BackButton />
```

### ListTemplate
Template genérico para exibir listas com filtros.
```jsx
<ListTemplate
  title="Título"
  columns={["Col1", "Col2"]}
  data={[]}
  onCreate={handleCreate}
  filters={<filters />}
/>
```

## � Backend - Em Desenvolvimento

O backend está parcialmente implementado com:

### ✅ Implementado
- [x] Servidor Express com CORS
- [x] Endpoints CRUD de Funcionários (/api/funcionarios)
- [x] Hash de senhas com bcrypt
- [x] Validação de duplicatas (CPF, Login)
- [x] Estrutura de repositório em memória
- [x] Remoção de senhas nas respostas

### ❌ Faltando
- [ ] Banco de dados real (PostgreSQL/MongoDB)
- [ ] Endpoints CRUD de Fornecedores
- [ ] Integração com frontend (fetch/axios)
- [ ] Autenticação com JWT
- [ ] Testes unitários
- [ ] Validação de CPF/CNPJ

**Próxima Fase**: Integrar frontend com backend (substituir console.log por fetch/axios)

## 📌 Próximos Passos

- [ ] Implementar endpoints de Fornecedores no backend
- [ ] Conectar frontend com API backend
- [ ] Implementar autenticação e autorização
- [ ] Adicionar banco de dados persistente
- [ ] Validação completa de formulários
- [ ] Testes automatizados
- [ ] Autenticação de usuários
- [ ] Funcionalidades de edição e exclusão
- [ ] Testes unitários e de integração
- [ ] Deploy em produção

## 📄 Licença

Projeto privado - Almoxarifado

## 👨‍💻 Desenvolvimento

Desenvolvido como sistema de gerenciamento interno.
