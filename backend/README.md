# 🚀 Vaggo - Backend

Este diretório contém o core do projeto Vaggo, uma API RESTful desenvolvida com foco em segurança, escalabilidade e performance, utilizando as melhores práticas de desenvolvimento Node.js.

## 🛠️ Tecnologias Utilizadas

- **Runtime & Framework**: Node.js & Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL & Supabase
- **ORM**: Sequelize (com suporte a Migrations)
- **Segurança**: Bcrypt (Hash) & JWT (Autenticação)
- **Validação**: Zod
- **Observabilidade**: Winston (Logging)
- **Infraestrutura**: Docker

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
 ┃ ┣ services/      # Lógica de negócios da aplicação
 ┃ ┣ types/         # Definições de tipos e interfaces TypeScript
 ┃ ┣ utils/         # Helpers, Loggers (Winston) e Wrappers (asyncHandler)
 ┃ ┗ server.ts      # Entry point da aplicação
 ┣ .env             # Variáveis sensíveis (não commitado)
 ┣ Dockerfile       # Configuração de container
 ┗ package.json     # Scripts e dependências
```

---

## 📌 Status do Desenvolvimento

### ✅ Implementado:

**Usuários**

- [x] Criação de usuário com validação completa (Zod v4) e hash de senha seguro (bcrypt).
- [x] Autenticação com Token JWT (incluindo tempo de expiração).
- [x] Listagem global de usuários com exclusão de dados sensíveis (senha).
- [x] Consulta de usuário por ID com dados relacionados (Person).
- [x] Atualização parcial de dados cadastrais com validação de ownership.
- [x] Remoção de usuário com deleção em cascata (User + Person) via transaction.
- [x] Verificação de duplicidade de CPF e e-mail antes do insert (409 Conflict).
- [x] Sistema de log profissional (Winston) e tratamento de erros centralizado.
- [x] Infraestrutura Docker finalizada (Dockerfile + docker-compose).

**Veículos**

- [x] Endpoint `POST /vehicles` — Cadastro de veículo vinculado ao usuário autenticado.
- [x] Endpoint `GET /vehicles` — Listagem de todos os veículos.
- [x] Endpoint `GET /vehicles/:id` — Consulta detalhada de um veículo.
- [x] Endpoint `PUT /vehicles/:id` — Atualização de dados do veículo.
- [x] Endpoint `DELETE /vehicles/:id` — Remoção de veículo.
- [x] Validação de placa duplicada (`LICENSE_PLATE_ALREADY_EXISTS` → 409).
- [x] Schema Zod para veículos (`createVehicleSchema`, `updateVehicleSchema`).

### 🚧 Próximas Etapas (Backlog):

---

## 🛠️ Endpoints da API

### Usuários `/users`

| Método     | Endpoint       | Descrição                      | Autenticação     |
| ---------- | -------------- | ------------------------------ | ---------------- |
| **POST**   | `/users`       | Cria um novo usuário           | Não              |
| **POST**   | `/users/login` | Login com retorno de Token JWT | Não              |
| **GET**    | `/users`       | Lista todos os usuários        | **Sim (Bearer)** |
| **GET**    | `/users/:id`   | Consulta um único usuário      | **Sim (Bearer)** |
| **PUT**    | `/users/:id`   | Atualiza dados do usuário      | **Sim (Bearer)** |
| **DELETE** | `/users/:id`   | Remove um usuário              | **Sim (Bearer)** |

### Veículos `/vehicles`

| Método     | Endpoint        | Descrição                 | Autenticação     |
| ---------- | --------------- | ------------------------- | ---------------- |
| **POST**   | `/vehicles`     | Cadastra um veículo       | **Sim (Bearer)** |
| **GET**    | `/vehicles`     | Lista todos os veículos   | **Sim (Bearer)** |
| **GET**    | `/vehicles/:id` | Consulta um único veículo | **Sim (Bearer)** |
| **PUT**    | `/vehicles/:id` | Atualiza dados do veículo | **Sim (Bearer)** |
| **DELETE** | `/vehicles/:id` | Remove um veículo         | **Sim (Bearer)** |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Docker & Docker Compose

### Subir o ambiente

```bash
# Constrói as imagens e sobe os containers (API + banco)
docker-compose up --build

# Rodar em background
docker-compose up -d

# Rodar as migrations dentro do container
docker exec -it vaggo_api npx sequelize-cli db:migrate --migrations-path src/database/migrations
```

### Comandos úteis Docker

```bash
docker-compose down          # Para e remove containers e redes
docker-compose stop          # Apenas para os containers
docker-compose logs -f       # Logs em tempo real
docker ps                    # Containers rodando
docker ps -a                 # Todos os containers (incluindo parados)
```

### Rodar localmente (sem Docker)

```bash
# Clone o repositório
git clone https://github.com/henrique151/Vaggo.git
cd backend

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env
# Edite o .env com suas credenciais do banco e JWT_SECRET

# Criação da tabela
npx sequelize-cli migration:generate --name create-users

# Sincronize o banco
npx sequelize-cli db:migrate

# Deleta o banco
npx sequelize-cli db:drop

# Inicie em modo desenvolvimento
npm run dev
```

---

## 🌿 Fluxo de Contribuição

Seguimos o padrão **Git Flow** para organização:

1. **Branch**: `git checkout -b feat/nome-da-feature`
2. **Commit**: Siga o [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`)
3. **PR**: Abra um Pull Request detalhando as mudanças para revisão.

Seguimos o padrão **Git Flow Avançado** para organização:

main: O código que está "em produção" (perfeito, sem erros).

develop: O código onde as funcionalidades se encontram antes de irem para a main.

feature/nome-da-tarefa: Onde você trabalha no dia a dia.

1. **Passo a Passo para você fazer agora**:
   Sair da main e ir para a develop (se ainda não tiver):

```bash
git checkout -b develop
```

2. **Criar a branch da sua tarefa (Feature)**:

```bash
git checkout -b feature/refactor-user-service
```

3. **Salvar suas alterações**:

```bash
git add .
git commit -m "feat(service): implement full UserService and refactor controllers"
```

4. **Enviar para o GitHub**:
   git push origin feature/refactor-user-service

5. **Abrir o PR**:
   No site do GitHub, você vai ver um botão "Compare & Pull Request". Você deve pedir para unir a sua feature/refactor-user-service DENTRO da develop.

6. **Finalizar**:
   Após você mesmo aprovar, você faz o "Merge". No final do semestre, você faz um PR da develop para a main para entregar a "Versão Final".

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por [Henrique](https://github.com/henrique151)**
