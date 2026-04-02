# 📡 Documentação de Dados e Endpoints

## 📊 Estrutura de Dados

### Funcionário

Campo responsável pelo gerenciamento de colaboradores do almoxarifado.

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@empresa.com",
  "cargo": "Almoxarife",
  "login": "joao_silva",
  "senha": "hash_bcrypt",
  "ativo": true,
  "dataCadastro": "2026-04-02T10:00:00Z",
  "dataAtualizacao": "2026-04-02T10:00:00Z"
}
```

#### Validações Esperadas
| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| nome | string | Mínimo 3 caracteres | "João Silva" |
| cpf | string | Formato XXX.XXX.XXX-XX ou 11 dígitos | "123.456.789-00" |
| email | string | Email válido | "joao@empresa.com" |
| cargo | string | Máximo 50 caracteres | "Almoxarife" |
| login | string | Mínimo 3 caracteres | "joao_silva" |
| senha | string | Mínimo 8 caracteres | — |

---

### Fornecedor

Entidade representando empresas fornecedoras de materiais.

```json
{
  "id": "uuid",
  "nome": "Distribuidora XYZ LTDA",
  "cnpj": "00.000.000/0000-00",
  "telefone": "(11) 9999-9999",
  "email": "contato@fornecedor.com",
  "endereco": "Rua das Flores, 123, São Paulo - SP",
  "ativo": true,
  "dataCadastro": "2026-04-02T10:00:00Z",
  "dataAtualizacao": "2026-04-02T10:00:00Z"
}
```

#### Validações Esperadas
| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| nome | string | Mínimo 3 caracteres | "Distribuidora XYZ" |
| cnpj | string | Formato XX.XXX.XXX/XXXX-XX ou 14 dígitos | "00.000.000/0000-00" |
| telefone | string | Formato válido | "(11) 9999-9999" |
| email | string | Email válido | "contato@fornecedor.com" |
| endereco | string | Mínimo 10 caracteres | "Rua das Flores, 123" |

---

## 🔌 Endpoints (Backend - Implementar)

### Base URL
```
http://localhost:5000/api
```

---

## 👥 Funcionários

### Listar Funcionários
```http
GET /funcionarios
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "cpf": "123.456.789-00",
      "email": "joao@empresa.com",
      "cargo": "Almoxarife"
    }
  ],
  "total": 1
}
```

---

### Obter Funcionário
```http
GET /funcionarios/:id
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "dados": {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@empresa.com",
    "cargo": "Almoxarife",
    "login": "joao_silva",
    "ativo": true
  }
}
```

---

### Criar Funcionário
```http
POST /funcionarios
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@empresa.com",
  "cargo": "Almoxarife",
  "login": "joao_silva",
  "senha": "senha_segura_123"
}
```

**Response (201 Created)**
```json
{
  "sucesso": true,
  "mensagem": "Funcionário cadastrado com sucesso",
  "dados": {
    "id": "uuid-gerado",
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@empresa.com",
    "cargo": "Almoxarife"
  }
}
```

**Response (400 Bad Request)**
```json
{
  "sucesso": false,
  "erro": "CPF inválido",
  "campo": "cpf"
}
```

---

### Atualizar Funcionário
```http
PUT /funcionarios/:id
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao.silva@empresa.com",
  "cargo": "Almoxarife Sênior"
}
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "mensagem": "Funcionário atualizado com sucesso",
  "dados": { }
}
```

---

### Deletar Funcionário
```http
DELETE /funcionarios/:id
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "mensagem": "Funcionário deletado com sucesso"
}
```

---

## 🏢 Fornecedores

### Listar Fornecedores
```http
GET /fornecedores
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "dados": [
    {
      "id": "uuid",
      "nome": "Fornecedor X",
      "cnpj": "00.000.000/0000-00",
      "telefone": "(11) 9999-9999",
      "email": "contato@fornecedor.com"
    }
  ],
  "total": 1
}
```

---

### Criar Fornecedor
```http
POST /fornecedores
Content-Type: application/json

{
  "nome": "Fornecedor X LTDA",
  "cnpj": "00.000.000/0000-00",
  "telefone": "(11) 9999-9999",
  "email": "contato@fornecedor.com",
  "endereco": "Rua das Flores, 123"
}
```

**Response (201 Created)**
```json
{
  "sucesso": true,
  "mensagem": "Fornecedor cadastrado com sucesso",
  "dados": {
    "id": "uuid-gerado",
    "nome": "Fornecedor X LTDA",
    "cnpj": "00.000.000/0000-00",
    "telefone": "(11) 9999-9999"
  }
}
```

---

### Atualizar Fornecedor
```http
PUT /fornecedores/:id
Content-Type: application/json

{
  "nome": "Fornecedor X LTDA",
  "telefone": "(11) 8888-8888",
  "email": "novo@fornecedor.com"
}
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "mensagem": "Fornecedor atualizado com sucesso"
}
```

---

### Deletar Fornecedor
```http
DELETE /fornecedores/:id
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "mensagem": "Fornecedor deletado com sucesso"
}
```

---

## 🔐 Autenticação (Futuro)

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "login": "joao_silva",
  "senha": "senha_segura_123"
}
```

**Response (200 OK)**
```json
{
  "sucesso": true,
  "token": "jwt_token_aqui",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "cargo": "Almoxarife"
  }
}
```

---

## 📋 Filtros e Paginação (Futuro)

### Exemplo com Filtros
```http
GET /funcionarios?nome=João&cargo=Almoxarife&pagina=1&limite=10
```

**Response**
```json
{
  "sucesso": true,
  "dados": [ ],
  "total": 5,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

---

## ❌ Códigos de Erro

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | OK | Operação bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos - verificar mensagem |
| 401 | Unauthorized | Não autenticado |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: CPF duplicado) |
| 500 | Server Error | Erro no servidor |

---

## 🔗 Exemplo de Chamada Completa

### Frontend (React)

```javascript
// Criar um novo funcionário
async function createFuncionario(data) {
  try {
    const response = await fetch('http://localhost:5000/api/funcionarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Se necessário
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro);
    }

    const result = await response.json();
    return result.dados;
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    throw error;
  }
}

// Uso
try {
  await createFuncionario({
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@empresa.com",
    cargo: "Almoxarife",
    login: "joao_silva",
    senha: "senha_segura_123"
  });
  navigate('/funcionarios');
} catch (error) {
  alert('Erro: ' + error.message);
}
```

---

**Última atualização**: Abril 2026
**Versão**: 0.1.0
