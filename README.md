# API GraphQL – Node.js, Express e SQLite

API desenvolvida com Node.js, Express e GraphQL para gerenciamento de usuários, com autenticação JWT e armazenamento de dados utilizando SQLite.

## Tecnologias utilizadas

- Node.js
- Express
- GraphQL
- express-graphql
- SQLite
- JWT (JSON Web Token)
- bcrypt

## Funcionalidades

- Cadastro de usuários.
- Login e autenticação.
- Consulta de todos os usuários.
- Consulta de usuário por ID.
- Consulta dos dados do usuário autenticado.
- Atualização de dados do usuário.
- Exclusão de usuário.
- Proteção de operações com JWT.
- Criptografia de senhas com bcrypt.

## Requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

## Instalação

Clone o repositório:

```bash
git clone https://github.com/dev-eduard/api-graphql.git
```

Entre na pasta:

```bash
cd api-graphql
```

Instale as dependências:

```bash
npm install
```

## Configuração

Crie o arquivo `.env` a partir do modelo:

```bash
cp .env.example .env
```

Configure as variáveis de ambiente:

```env
PORT=3000
JWT_SECRET=sua_chave_secreta
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Utilize uma chave JWT forte e aleatória.

## Executando o projeto

Para iniciar em modo de desenvolvimento:

```bash
npm run dev
```

Para iniciar em modo de produção:

```bash
npm start
```

A API estará disponível em:

```text
http://localhost:3000
```

## Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/health` | Verifica o funcionamento da API |
| POST | `/api` | Endpoint principal GraphQL |

Todas as operações GraphQL são realizadas através do endpoint `/api`.

---

# Testando com Thunder Client

As requisições GraphQL devem utilizar:

- Método: `POST`
- URL: `http://localhost:3000/api`
- Content-Type: `application/json`

## 1. Cadastro de usuário

**Operação:** `registrar`

Não necessita de autenticação.

```json
{
  "query": "mutation { registrar(nome: \"Marcos\", email: \"marcos@email.com\", senha: \"12345678\") { token usuario { id nome email criado_em } } }"
}
```

Retorna o token JWT e os dados do usuário cadastrado.

## 2. Login

**Operação:** `login`

Não necessita de autenticação.

```json
{
  "query": "mutation { login(email: \"marcos@email.com\", senha: \"12345678\") { token usuario { id nome email criado_em } } }"
}
```

Retorna um token JWT válido por uma hora.

## 3. Listar usuários

**Operação:** `usuarios`

Requer autenticação.

```json
{
  "query": "{ usuarios { id nome email criado_em } }"
}
```

## 4. Consultar usuário por ID

**Operação:** `usuario`

Requer autenticação.

```json
{
  "query": "query { usuario(id: \"1\") { id nome email criado_em } }"
}
```

## 5. Consultar usuário autenticado

**Operação:** `me`

Requer autenticação.

```json
{
  "query": "{ me { id nome email criado_em } }"
}
```

## 6. Atualizar usuário

**Operação:** `atualizarUsuario`

Requer autenticação.

```json
{
  "query": "mutation { atualizarUsuario(id: \"1\", nome: \"Marcos Eduardo\", email: \"marcos.novo@email.com\") { id nome email criado_em } }"
}
```

O usuário só pode atualizar seus próprios dados.

## 7. Excluir usuário

**Operação:** `excluirUsuario`

Requer autenticação.

```json
{
  "query": "mutation { excluirUsuario(id: \"1\") }"
}
```

Retorna `true` quando a exclusão é realizada com sucesso.

---

## Autenticação JWT

Para executar operações protegidas, adicione o seguinte Header no Thunder Client:

| KEY | VALUE |
|---|---|
| Authorization | Bearer SEU_TOKEN_JWT |

Substitua `SEU_TOKEN_JWT` pelo token retornado no cadastro ou login.

As operações protegidas verificam a identidade do usuário por meio do token.

## Banco de dados

O projeto utiliza SQLite para armazenar os dados.

Arquivo do banco:

```text
db/banco.db
```

Tabela principal: `usuarios`.

| Campo | Tipo | Descrição |
|---|---|---|
| id | INTEGER | Identificador do usuário |
| nome | TEXT | Nome do usuário |
| email | TEXT | Email do usuário |
| senha | TEXT | Hash da senha |
| criado_em | TEXT | Data de criação |

As senhas são protegidas utilizando bcrypt.

## Estrutura do projeto

```text
api-graphql/
├── src/
│   ├── schema.js
│   └── ...
├── db/
│   └── banco.db
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## Regras de segurança

- Senhas devem possuir pelo menos 8 caracteres.
- Emails devem possuir formato válido.
- Emails cadastrados não podem ser duplicados.
- Operações privadas exigem autenticação JWT.
- Usuários só podem alterar ou excluir seus próprios registros.
- Senhas são armazenadas com hash bcrypt.

