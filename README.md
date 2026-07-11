# Almoxarifado GILFER — Sistema Web de Gestão de Almoxarifado

**Link Funcional** = gilferalmoxarifado.com

Aplicação web full-stack para a **Construtora GILFER**. O sistema controla o estoque de materiais de construção distribuído entre múltiplos almoxarifados (canteiros de obra), cobrindo todo o ciclo de entrada e saída de mercadorias.

## Sobre o projeto

O sistema gerencia **módulos** com operações CRUD completas:

- **Fornecedores** — cadastro com CNPJ, e-mail, múltiplos telefones e endereços.
- **Funcionários** — cadastro com CPF, cargo e credencial de acesso ao sistema.
- **Produtos** — materiais com unidade de medida e estoque mínimo/máximo.
- **Almoxarifados** — depósitos por canteiro, com endereço e telefones.
- **Compras** — pedidos de aquisição a fornecedores, com itens e nota fiscal; ao serem recebidas, dão entrada no estoque.
- **Saídas** — movimentação por **consumo** ou **transferência** entre almoxarifados, com baixa/movimentação automática de estoque.
- **Equipes** — Equipe de funcionários que atua na utilização do materiais.

O saldo de estoque por almoxarifado é mantido de forma consistente por meio de transações e de validações de regra de negócio (saldo nunca negativo).

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Front-end | React 19, Material UI (MUI) 7, React Router 7, Recharts |
| Back-end | Node.js (módulos ES), Express 4, Sequelize 6, bcrypt, uuid, cors |
| Banco de dados | MySQL (driver mysql2) |

**Arquitetura do back-end** (em `src/api`): separação em quatro camadas — **Routes → Controllers → Services → Repositories** — com os modelos Sequelize em `models/`.

## Pré-requisitos

- **Node.js** 18+ e **npm**
- **MySQL** 8+ em execução

## Como executar

A aplicação tem **três partes**: o **banco de dados** (MySQL), o **back-end** (API Node, porta 5000) e o **front-end** (React, porta 3000). Back-end e front-end rodam em terminais separados. Siga a ordem abaixo.

### 1. Banco de dados

Crie o banco executando o script de criação no MySQL:

```bash
mysql -u root -p < "Banco de Dados/CREATE_DB_ALMOXARIFADO_GILFER_v7.sql"
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

## Controle de acesso (autenticação e autorização)

O sistema exige **login** e aplica permissões por **nível de acesso**. As credenciais
ficam na tabela `Usuarios_Sistema` (login pelo **e-mail do funcionário**, senha em
`password_hash` com **bcrypt**). O nível fica em `access_level`:

| Nível | Telas que enxerga | Escrita |
|---|---|---|
| **CENTRAL** | Todas (inclui Funcionários/usuários) | Tudo |
| **ALMOXARIFE** | Fornecedores, Produtos, Almoxarifados, Compras, Saídas | Cria/edita nesses módulos |
| **AUXILIAR** | Produtos, Almoxarifados, Saídas | Só cria **Saídas** (resto: leitura) |
| **CONSULTA** | Produtos, Almoxarifados, Compras, Saídas | Nenhuma (só leitura) |

**Como funciona:**

- **Login:** `POST /api/auth/login` `{ email, senha }` → devolve um **JWT** (validade padrão 8h) e os dados do usuário. O token é enviado em `Authorization: Bearer <token>` a cada requisição.
- **Back-end:** todas as rotas (exceto `/api/auth/login`) exigem token válido (`autenticar`) e respeitam a matriz de permissões por módulo (`autorizarModulo`) — leitura vs. escrita conforme o método HTTP. Fonte da verdade: [`src/api/config/permissions.js`](src/api/config/permissions.js).
- **Front-end:** guardas de rota (`ProtectedRoute`/`RequireModule`), menu filtrado por nível e botões de escrita ocultos para quem é só leitura. Espelho da matriz em [`src/auth/permissions.js`](src/auth/permissions.js) — **mantenha os dois arquivos em sincronia**.

### Primeiro acesso (criar o admin CENTRAL)

Como o cadastro de funcionários passou a exigir login, use o script de bootstrap
uma vez para criar o primeiro usuário **CENTRAL** (a partir de `src/api`):

```bash
npm run seed:admin -- admin@gilfer.com senha12345 "Administrador"
```

Depois, faça login no front-end com esse e-mail/senha. A partir daí o CENTRAL
cria os demais funcionários e define o nível de acesso de cada um.

> Em produção, defina a variável de ambiente **`JWT_SECRET`** (e opcionalmente
> `JWT_EXPIRES_IN`). Sem ela, um segredo de desenvolvimento é usado e um aviso
> é emitido no console.

### Solicitação de cadastro e vínculo a almoxarifado

Qualquer pessoa pode **solicitar acesso** pela tela pública `/solicitar-cadastro`
(link no login). O pedido entra numa fila; o **CENTRAL** revisa em **Solicitações**
(menu exclusivo do CENTRAL) e, ao aprovar, define o **nível** e o **cargo** e —
para qualquer nível que **não seja CENTRAL** — **vincula a conta a um almoxarifado**.

A partir daí o usuário **só tem acesso àquele almoxarifado**: o vínculo fica em
`Funcionarios.cod_almoxarifado`, viaja no JWT e é aplicado no back-end
(`src/api/utils/escopo.js`) em **Almoxarifados, Saídas e Compras** — listas
filtradas e operações de escrita travadas no almoxarifado do usuário (a origem da
saída e o destino da compra são forçados no back-end). O CENTRAL não tem vínculo e
enxerga tudo.

> **Migração de banco (v7).** Estas funções exigem a coluna
> `Funcionarios.cod_almoxarifado` e a tabela `Solicitacoes_Cadastro`. Em um
> banco **já existente**, rode uma vez:
> ```bash
> mysql -u root -p bd_almoxarifado < "Banco de Dados/ALTER_v7_almoxarifado_no_funcionario.sql"
> ```
> Instalações do zero pelo script `CREATE_DB_..._v7.sql` já incluem as duas estruturas.

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