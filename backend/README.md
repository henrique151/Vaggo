# 🚀 Veggo - Backend

Este diretório contém o core do projeto Veggo, uma API RESTful desenvolvida com foco em segurança, escalabilidade e performance, utilizando as melhores práticas de desenvolvimento Node.js.

## 🛠️ Tecnologias Utilizadas

* **Runtime & Framework**: Node.js & Express.js
* **Linguagem**: TypeScript
* **Banco de Dados**: PostgreSQL & Supabase
* **ORM**: Sequelize (com suporte a Migrations)
* **Segurança**: Bcrypt (Hash) & JWT (Autenticação)
* **Validação**: Zod
* **Observabilidade**: Winston (Logging)
* **Infraestrutura**: Docker (🚧 em progresso)

---

## 📂 Estrutura de Pastas (Arquitetura)

O projeto segue o padrão **MVC (Model-View-Controller)** para garantir a separação de responsabilidades:

```bash
backend/
 ┣ migrations/      # Histórico de alterações do banco de dados (Sequelize)
 ┣ src/
 ┃ ┣ config/        # Configurações de ambiente e variáveis globais
 ┃ ┣ controllers/   # Lógica de negócio e tratamento de requisições
 ┃ ┣ database/      # Inicialização e conexão do Sequelize
 ┃ ┣ middlewares/   # Auth (JWT), Validação (Zod) e Error Handler global
 ┃ ┣ models/        # Definição das entidades do banco de dados
 ┃ ┣ routes/        # Definição dos endpoints e mapeamento de rotas
 ┃ ┣ schemas/       # Contratos de validação de dados (Zod)
 ┃ ┣ types/         # Definições de tipos e interfaces TypeScript
 ┃ ┣ utils/         # Helpers, Loggers (Winston) e Wrappers (asyncHandler)
 ┃ ┗ server.ts      # Entry point da aplicação
 ┣ .env             # Variáveis sensíveis (não commitado)
 ┣ Dockerfile       # Configuração de container (🚧 em progresso)
 ┗ package.json     # Scripts e dependências

```

---

## 📌 Status do Desenvolvimento

### ✅ Implementado:

* [x] Criação de usuário com hash de senha seguro.
* [x] Autenticação com Token JWT (incluindo tempo de expiração).
* [x] Listagem global de usuários com proteção de dados sensíveis.
* [x] Remoção de usuários protegida por middleware de autenticação.
* [x] Sistema de log profissional e tratamento de erros centralizado.

### 🚧 Próximas Etapas (Backlog):

* [ ] Endpoint `GET /users/:id` (Consulta detalhada de perfil).
* [ ] Endpoint `PUT /users/:id` (Atualização de dados cadastrais).
* [ ] Finalização da orquestração Docker (Dockerfile e docker-compose).

---

## 🛠️ Endpoints da API

| Método | Endpoint | Descrição | Autenticação |
| --- | --- | --- | --- |
| **POST** | `/users` | Cria um novo usuário | Não |
| **POST** | `/users/login` | Login com retorno de Token JWT | Não |
| **GET** | `/users` | Lista todos os usuários | Não |
| **GET** | `/users/:id` | Consulta um único usuário | **🚧 Backlog** |
| **PUT** | `/users/:id` | Atualiza dados do usuário | **🚧 Backlog** |
| **DELETE** | `/users/:id` | Remove um usuário | **Sim (Bearer)** |

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos

* Node.js (v18+)
* Instância PostgreSQL (Local ou Supabase)

### 2. Configuração

```bash
# Clone o repositório
git clone https://github.com/henrique151/veggo.git

# Acesse a pasta
cd backend

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

```

> **Atenção:** Edite o arquivo `.env` com suas credenciais do banco e uma `JWT_SECRET` segura.

### 3. Migrations e Execução

```bash
# Sincronize o banco de dados
npx sequelize-cli db:migrate

# Inicie em modo desenvolvimento
npm run dev

```

---

## 🌿 Fluxo de Contribuição

Seguimos o padrão **Git Flow** para organização:

1. **Branch**: `git checkout -b feat/nome-da-feature`
2. **Commit**: Siga o [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`)
3. **PR**: Abra um Pull Request detalhando as mudanças para revisão.

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para mais detalhes.

---

**Desenvolvido por [Henrique]** *Conecte-se comigo no [LinkedIn*](https://www.google.com/search?q=https://www.linkedin.com/in/seu-perfil/)

---



