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

## 🛠️ Endpoints da API

### Usuários `/users`

| Método     | Endpoint       | Descrição                      | Autenticação     |
| :--------- | :------------- | :----------------------------- | :--------------- |
| **POST**   | `/users`       | Cria um novo usuário           | Não              |
| **POST**   | `/users/login` | Login com retorno de Token JWT | Não              |
| **GET**    | `/users`       | Lista todos os usuários        | **Sim (Bearer)** |
| **GET**    | `/users/:id`   | Consulta um único usuário      | **Sim (Bearer)** |
| **PUT**    | `/users/:id`   | Atualiza dados do usuário      | **Sim (Bearer)** |
| **DELETE** | `/users/:id`   | Remove um usuário              | **Sim (Bearer)** |

### Veículos `/vehicles`

| Método     | Endpoint                | Descrição                    | Autenticação     |
| :--------- | :---------------------- | :--------------------------- | :--------------- |
| **POST**   | `/vehicles`             | Cadastra um veículo          | **Sim (Bearer)** |
| **GET**    | `/vehicles`             | Lista todos os veículos      | **Sim (Bearer)** |
| **GET**    | `/vehicles/my-vehicles` | Consulta veículos do usuário | **Sim (Bearer)** |
| **GET**    | `/vehicles/:userId/:id` | Consulta um único veículo    | **Sim (Bearer)** |
| **PUT**    | `/vehicles/:id`         | Atualiza dados do veículo    | **Sim (Bearer)** |
| **DELETE** | `/vehicles/:id`         | Remove um veículo            | **Sim (Bearer)** |

### Localização `/states`

| Método  | Endpoint             | Descrição                  | Autenticação |
| :------ | :------------------- | :------------------------- | :----------- |
| **GET** | `/states`            | Lista todos os estados     | Não          |
| **GET** | `/states/:id/cities` | Lista cidades de um estado | Não          |

### Propriedades `/properties`

| Método     | Endpoint                    | Descrição                                    | Autenticação     |
| :--------- | :-------------------------- | :------------------------------------------- | :--------------- |
| **POST**   | `/properties`               | Cadastra um novo estacionamento              | **Sim (Bearer)** |
| **GET**    | `/properties`               | Lista todos os estacionamentos               | **Sim (Bearer)** |
| **GET**    | `/properties/my-properties` | Lista estacionamentos do usuário autenticado | **Sim (Bearer)** |
| **GET**    | `/properties/:id`           | Detalhes da propriedade (somente as suas)    | **Sim (Bearer)** |
| **PUT**    | `/properties/:id`           | Atualiza dados (endereço, nome, etc)         | **Dono**         |
| **DELETE** | `/properties/:id`           | Remove uma propriedade                       | **Dono**         |

### Vagas `/spots`

| Método     | Endpoint                        | Descrição                                   | Autenticação     |
| :--------- | :------------------------------ | :------------------------------------------ | :--------------- |
| **POST**   | `/properties/:propId/spots`     | Gera vagas para uma propriedade             | **Dono**         |
| **GET**    | `/properties/:propId/spots`     | Lista vagas de um estacionamento específico | **Sim (Bearer)** |
| **PUT**    | `/properties/:propId/spots/:id` | Atualiza dados da vaga (cobertura, tamanho) | **Dono**         |
| **DELETE** | `/properties/:propId/spots/:id` | Remove uma vaga da propriedade              | **Dono**         |
| **PATCH**  | `/spots/:id/status`             | Altera status da vaga (Ocupar/Liberar)      | **Sim (Bearer)** |
| **PATCH**  | `/spots/:id/evaluate`           | Aprova ou recusa uma vaga                   | **Sim (Bearer)** |

### Reservas `/reservations`

| Método    | Endpoint                                | Descrição                 | Autenticação     |
| :-------- | :-------------------------------------- | :------------------------ | :--------------- |
| **GET**   | `/reservations/search/(address ou cep)` | Buscar uma vaga           | **Sim (Bearer)** |
| **PATCH** | `/reservations::id/reject`              | Rejectar a reserva        | **Dono**         |
| **PATCH** | `/reservations/:id/cancel`              | Cancela uma reserva       | **Dono**         |
| **PATCH** | `/reservations/:id/approve`             | Aprova a reserva          | **Dono**         |
| **GET**   | `/reservations`                         | Lista reservas do usuário | **Sim (Bearer)** |
| **GET**   | `/reservations/owner`                   | Lista reservas do dono    | **Dono**         |
| **POST**  | `/reservations`                         | Reserva uma vaga          | **Sim (Bearer)** |

---

## 📌 Próximas Etapas (Backlog)

### Avaliações `/reviews`

| Método     | Endpoint                  | Descrição                       | Autenticação     |
| :--------- | :------------------------ | :------------------------------ | :--------------- |
| **POST**   | `/properties/:id/reviews` | Avalia um estacionamento        | **Sim (Bearer)** |
| **GET**    | `/properties/:id/reviews` | Lista avaliações da propriedade | **Sim (Bearer)** |
| **DELETE** | `/reviews/:id`            | Remove avaliação própria        | **Sim (Bearer)** |

### Denúncias `/reports`

| Método   | Endpoint                  | Descrição                | Autenticação     |
| :------- | :------------------------ | :----------------------- | :--------------- |
| **POST** | `/properties/:id/reports` | Denuncia uma propriedade | **Sim (Bearer)** |
| **GET**  | `/reports`                | Lista denúncias          | **Admin**        |

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

# Rodar o seed no Docker
docker exec -it vaggo_api npx sequelize-cli db:seed:all
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

# Rodar o seed
npx sequelize-cli db:seed:all

# Gera o arquivo de seed
npx sequelize-cli seed:generate --name seed-states-cities

# Resetar o banco
npx sequelize-cli db:migrate:undo:all

# Inicie em modo desenvolvimento
npm run dev
```

---

## 🌿 Fluxo de Contribuição

Seguimos o padrão **Git Flow Avançado** para organização:

- `main` — código em produção (estável, sem erros)
- `develop` — integração das features antes de ir para a main
- `feature/nome-da-tarefa` — onde o desenvolvimento acontece no dia a dia

### Passo a passo

```bash
# 1. Criar a branch da feature a partir da develop
git checkout develop
git checkout -b feature/nome-da-feature

# 2. Salvar as alterações
git add .
git commit -m "feat(scope): descrição da mudança"

# 3. Enviar para o GitHub
git push origin feature/nome-da-feature
```

> No GitHub, abra um Pull Request de `feature/nome-da-feature` → `develop`. Ao final do semestre, abre-se um PR de `develop` → `main` para a entrega final.

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido por [Henrique](https://github.com/henrique151)**
