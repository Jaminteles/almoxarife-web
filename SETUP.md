# ⚙️ Guia de Configuração e Setup

## 🚀 Setup Inicial do Projeto

### Pré-requisitos

- **Node.js**: v14 ou superior
- **npm** ou **yarn**
- **Git**: para controle de versão
- **VS Code** (recomendado): Editor de código

### Verificar Versões

```bash
node --version    # v14+
npm --version     # v6+
git --version     # git version 2.x
```

---

## 📦 Instalação das Dependências

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/almoxarife-web.git
cd almoxarife-web
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instalará automaticamente todas as dependências do `package.json`:

```json
{
  "react": "^19.2.4",
  "react-router-dom": "^7.13.2",
  "@mui/material": "^7.3.9",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/icons-material": "^7.3.9"
}
```

### 3. Verificar Instalação

```bash
npm list
```

---

## 🏃 Executar a Aplicação

### Em Desenvolvimento

```bash
npm start
```

- **URL**: http://localhost:3000
- **Hot Reload**: Ativado (mudanças refletem automaticamente)
- **DevTools**: Disponível no navegador (F12)

### Em Produção

```bash
npm run build
```

Cria pasta `build/` otimizada para deployment.

```bash
serve -s build
```

Ou deploy direto em hospedagem (Vercel, Netlify, etc).

---

## 📁 Estrutura de Arquivos Gerada

```
almoxarife-web/
├── node_modules/          # Dependências instaladas
├── public/                # Arquivos estáticos
│   ├── index.html         # HTML principal
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── pages/             # Páginas/Rotas
│   ├── layouts/           # Layouts
│   ├── App.js             # App principal
│   ├── index.js           # Entry point
│   └── ...
├── package.json           # Dependências e scripts
├── package-lock.json      # Lock de versões
├── README.md              # Documentação
├── .gitignore            # Arquivos ignorados
└── ...
```

---

## 🔧 Variáveis de Ambiente

### Criar Arquivo `.env`

Na raiz do projeto, crie `.env`:

```env
# API
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000

# Autenticação
REACT_APP_JWT_KEY=sua_chave_jwt_aqui

# Ambiente
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Analytics (futuro)
REACT_APP_GOOGLE_ANALYTICS_ID=seu_id_aqui
```

### Usar Variáveis no Código

```javascript
const apiUrl = process.env.REACT_APP_API_URL;
const isDev = process.env.REACT_APP_ENV === 'development';

console.log(`Conectando a: ${apiUrl}`);
```

### Arquivo `.env.example`

Crie `.env.example` para documentação:

```env
# Copie para .env e preencha os valores
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_JWT_KEY=sua_chave_aqui
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

---

## 🐍 Backend (Opcional - Setup Recomendado)

### Python + Flask (Exemplo)

#### 1. Criar Pasta Backend

```bash
mkdir backend
cd backend
python -m venv venv
```

#### 2. Ativar Virtual Environment

**Windows**:
```bash
venv\Scripts\activate
```

**Mac/Linux**:
```bash
source venv/bin/activate
```

#### 3. Instalar Dependências

```bash
pip install flask
pip install flask-cors
pip install python-dotenv
pip install sqlalchemy
```

#### 4. Criar `app.py` Básico

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/funcionarios', methods=['GET'])
def get_funcionarios():
    return jsonify({
        'sucesso': True,
        'dados': [
            {'id': 1, 'nome': 'João', 'cpf': '123', 'email': 'joao@email.com'}
        ]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

#### 5. Rodar Backend

```bash
python app.py
```

---

## 🗄️ Banco de Dados

### PostgreSQL (Recomendado)

#### Instalar PostgreSQL

- **Windows**: [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### Criar Banco de Dados

```bash
psql -U postgres
CREATE DATABASE almoxarife;
\l  # Listar bancos
```

#### Conectar (Python)

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="almoxarife",
    user="postgres",
    password="sua_senha"
)
cursor = conn.cursor()
```

### MongoDB (Alternativa)

```bash
# Instalar MongoDB
brew install mongodb-community

# Rodar
brew services start mongodb-community

# Usar em Python
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['almoxarife']
```

---

## 🔌 Extensões VS Code Recomendadas

Instale essas extensões para melhor desenvolvimento:

1. **ES7+ React/Redux/React-Native snippets**
   - ID: `dsznajder.es7-react-js-snippets`

2. **Prettier - Code Formatter**
   - ID: `esbenp.prettier-vscode`

3. **ESLint**
   - ID: `dbaeumer.vscode-eslint`

4. **REST Client**
   - ID: `humao.rest-client`

5. **Thunder Client** (tester de API)
   - ID: `rangav.vscode-thunder-client`

Ou integre no `extensions.json`:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dsznajder.es7-react-js-snippets",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "humao.rest-client",
    "rangav.vscode-thunder-client"
  ]
}
```

---

## 🎨 Configurar Prettier

Crie `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 🚨 Configurar ESLint

Crie `.eslintrc.json`:

```json
{
  "extends": ["react-app"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "no-var": "error",
    "prefer-const": "error"
  }
}
```

---

## 📝 Configurar Git

### `.gitignore`

Já vem com Create React App, mas adicione:

```
# Ambiente
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Cache
.eslintcache
```

### Commits

```bash
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

git add .
git commit -m "feat: descrição da mudança"
git push origin main
```

---

## 🧪 Configurar Testes

Já vem com `jest` e `@testing-library/react`.

Criar `.env.test`:

```env
SKIP_PREFLIGHT_CHECK=true
```

Rodar testes:

```bash
npm test                    # Modo watch
npm test -- --coverage      # Com cobertura
npm test -- --watchAll=false  # Roda uma vez
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Docker

Crie `Dockerfile`:

```dockerfile
FROM node:19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build:
```bash
docker build -t almoxarife-web .
docker run -p 3000:3000 almoxarife-web
```

---

## 📊 Scripts Disponíveis

| Script | Comando | O que faz |
|--------|---------|----------|
| `start` | `npm start` | Inicia dev server |
| `build` | `npm run build` | Build para produção |
| `test` | `npm test` | Executa testes |
| `eject` | `npm run eject` | Expõe configurações (irreversível) |

---

## 🔍 Troubleshooting de Setup

### ❌ "npm: command not found"

```bash
# Reinstalar Node.js
# Ou usar NVM (Node Version Manager)
# nvm install 19
# nvm use 19
```

### ❌ "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID PID_NUMERO /F

# Mac/Linux
lsof -i :3000
kill -9 PID_NUMERO

# Ou mudar porta
PORT=3001 npm start
```

### ❌ "Module not found"

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
```

### ❌ "git not found"

```bash
# Instalar Git
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git
```

---

## ✅ Checklist de Setup Completo

- [ ] Node.js instalado (v14+)
- [ ] Git instalado
- [ ] Repositório clonado
- [ ] `npm install` completo
- [ ] `.env` criado
- [ ] `npm start` funcionando
- [ ] App aberto em http://localhost:3000
- [ ] DevTools abrindo (F12)
- [ ] Nenhum erro no console
- [ ] Extensões VS Code instaladas
- [ ] Backend preparado (opcional)

---

## 🆘 Precisa de Ajuda?

1. Verifique [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Consulte [DEVELOPMENT.md](./DEVELOPMENT.md)
3. Leia [README.md](./README.md)
4. Procure em [Stack Overflow](https://stackoverflow.com)

---

**Última atualização**: Abril 2026
**Versão**: 0.1.0
