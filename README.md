# Almoxarifado GILFER — Sistema Web de Gestão de Almoxarifado

Aplicação web full-stack para a **Construtora GILFER** (empresa fictícia, Bahia), desenvolvida para a disciplina de **Programação Web II** (2026.1). O sistema controla o estoque de materiais de construção distribuído entre múltiplos almoxarifados (canteiros de obra), cobrindo todo o ciclo de entrada e saída de mercadorias.

## Sobre o projeto

O sistema gerencia **seis módulos** com operações CRUD completas:

- **Fornecedores** — cadastro com CNPJ, e-mail, múltiplos telefones e endereços.
- **Funcionários** — cadastro com CPF, cargo e credencial de acesso ao sistema.
- **Produtos** — materiais com unidade de medida e estoque mínimo/máximo.
- **Almoxarifados** — depósitos por canteiro, com endereço e telefones.
- **Compras** — pedidos de aquisição a fornecedores, com itens e nota fiscal; ao serem recebidas, dão entrada no estoque.
- **Saídas** — movimentação por **consumo** ou **transferência** entre almoxarifados, com baixa/movimentação automática de estoque.

O saldo de estoque por almoxarifado é mantido de forma consistente por meio de transações e de validações de regra de negócio (saldo nunca negativo).

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | React 19, Material UI (MUI) 7, React Router 7, Recharts |
| Back-end | Node.js (módulos ES), Express 4, Sequelize 6, bcrypt, uuid, cors |
| Banco de dados | MySQL (driver mysql2) |

**Arquitetura do back-end** (em `src/api`): separação em quatro camadas — **Routes → Controllers → Services → Repositories** — com os modelos Sequelize em `models/`.

## Estrutura do projeto

```
almoxarife-web/
├── Banco de Dados/
│   ├── CREATE_DB_ALMOXARIFADO_GILFER_v4.sql   # script de criação do banco (versão atual)
│   └── POPULA_DADOS_ALMOXARIFADO_GILFER.sql   # dados de exemplo (opcional)
├── src/
│   ├── api/                       # BACK-END (Node.js + Express + Sequelize)
│   │   ├── routes/                # endpoints da API
│   │   ├── controllers/           # tratamento de requisição/resposta
│   │   ├── services/              # regra de negócio e transações
│   │   ├── repositories/          # acesso ao banco via Sequelize
│   │   ├── models/                # modelos e associações
│   │   ├── utils/                 # helpers (ex.: movimentação de estoque)
│   │   ├── app.js                 # configuração do Express e rotas
│   │   └── server.js              # inicialização do servidor (porta 5000)
│   ├── pages/                     # FRONT-END — telas por módulo
│   │   ├── funcionarios/  fornecedores/  produtos/
│   │   ├── almoxarifados/ compras/       saidas/
│   ├── components/                # componentes reutilizáveis (ListTemplate, etc.)
│   ├── layouts/                   # layout principal (AppBar + Drawer)
│   └── App.js                     # rotas e tema do front-end
└── package.json                   # dependências do front-end
```

## Pré-requisitos

- **Node.js** 18+ e **npm**
- **MySQL** 8+ em execução

## Como executar

A aplicação tem **três partes**: o **banco de dados** (MySQL), o **back-end** (API Node, porta 5000) e o **front-end** (React, porta 3000). Back-end e front-end rodam em terminais separados. Siga a ordem abaixo.

### 1. Banco de dados

Crie o banco executando o script de criação no MySQL:

```bash
mysql -u root -p < "Banco de Dados/CREATE_DB_ALMOXARIFADO_GILFER_v4.sql"
```

Opcionalmente, popule com dados de exemplo:

```bash
mysql -u root -p < "Banco de Dados/POPULA_DADOS_ALMOXARIFADO_GILFER.sql"
```

### 2. Back-end (API)

As credenciais de conexão estão em `src/api/models/index.js` e podem ser sobrescritas por variáveis de ambiente. **Ajuste-as conforme o seu MySQL** antes de iniciar:

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_NAME` | `bd_almoxarifado` | nome do banco |
| `DB_USER` | `root` | usuário do MySQL |
| `DB_PASSWORD` | `desus` | senha do usuário |
| `DB_HOST` | `localhost` | host do banco |

> Confirme que o nome do banco (`DB_NAME`) corresponde ao banco criado pelo script SQL.

Em seguida, instale as dependências e inicie a API:

```bash
cd src/api
npm install
npm start          # ou: npm run dev  (com recarga automática via nodemon)
```

A API sobe em **http://localhost:5000**, com os endpoints sob o prefixo `/api`
(ex.: `/api/produtos`, `/api/compras`, `/api/saidas`, `/api/fornecedores`,
`/api/funcionarios`, `/api/almoxarifados`).

### 3. Front-end

Em outro terminal, a partir da **raiz do projeto**:

```bash
npm install
npm start
```

O front-end abre em **http://localhost:3000** e consome a API em `http://localhost:5000/api`.

## Endpoints principais (API REST)

Todos os módulos seguem o mesmo padrão de operações CRUD:

| Método | Rota | Operação |
|---|---|---|
| `GET` | `/api/{modulo}` | listar |
| `GET` | `/api/{modulo}/:id` | buscar por id |
| `POST` | `/api/{modulo}` | criar |
| `PUT` | `/api/{modulo}/:id` | atualizar |
| `DELETE` | `/api/{modulo}/:id` | excluir / inativar |

Módulos disponíveis: `funcionarios`, `fornecedores`, `produtos`, `almoxarifados`, `compras`, `saidas` (e `cargos`, de apoio).

As respostas seguem o envelope `{ sucesso, dados, erro }`.

## Observações

- **Ordem de inicialização:** o banco deve existir antes de subir a API. O servidor não recria as tabelas (`sync({ alter: false })`); ele apenas se conecta ao banco criado pelo script SQL.
- **Exclusão lógica:** Fornecedores, Funcionários e Almoxarifados usam *soft delete* (campo de ativo). Saídas usam exclusão física.
- **Integridade do estoque:** compras e saídas movimentam o estoque dentro de transações; uma saída é bloqueada quando não há saldo suficiente.