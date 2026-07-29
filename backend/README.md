# Vaggo (Plataforma de compartilhamento de vagas de estacionamento) - Backend

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](#licença)

> Este diretório contém o core do projeto Vaggo (Plataforma de Compartilhamento de Vagas). Trata-se de uma API REST desenvolvida para o gerenciamento completo de estacionamentos, vagas, reservas, chats em tempo real e administração da plataforma. O projeto foi construído com foco em segurança, escalabilidade e alta performance, utilizando as melhores práticas de desenvolvimento em Node.js.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Equipe](#equipe)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Scripts](#scripts)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Swagger](#documentação-e-testes-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Rotas da API](#rotas-da-api)
- [Autenticação](#autenticação)
- [Próximas Melhoria](#próximas-melhorias)
- [Contribuindo](#contribuindo)

---

## Sobre o Projeto

O **Vaggo** é uma plataforma de compartilhamento de vagas de estacionamento que conecta proprietários de espaços ociosos a motoristas que precisam de vagas. A plataforma oferece:

- Cadastro e gerenciamento de proprietários, motoristas e veículos
- Publicação e busca geolocalizada de vagas disponíveis
- Sistema de reservas com controle de conflitos e disponibilidade por horário/dia da semana
- Chat em tempo real entre locatário e proprietário
- Painel administrativo para gestão da plataforma

---

## Tecnologias

### Backend

| Tecnologia                   | Uso                                            |
| ---------------------------- | ---------------------------------------------- |
| **Node.js** + **TypeScript** | Runtime e linguagem principal                  |
| **Express**                  | Framework HTTP                                 |
| **Socket.io**                | WebSockets para chat e eventos em tempo real   |
| **Sequelize**                | ORM para banco de dados relacional             |
| **PostgreSQL**               | Banco de dados principal                       |
| **JWT**                      | Autenticação e autorização                     |
| **Zod v4**                   | Validação de schemas e request bodies          |
| **Cloudinary**               | Upload e gestão de imagens                     |
| **Google Maps API**          | Geocodificação e busca geoespacial (Haversine) |
| **Docker**                   | Containerização                                |
| **Twilio (WhatsApp & SMS)**  | Envio de notificações via WhatsApp e SMS       |
| **Render**                   | Plataforma de deploy e hospedagem do backend   |
| **Neon**                     | Banco de dados PostgreSQL serverless           |

### Frontend

| Tecnologia              | Uso                                       |
| ----------------------- | ----------------------------------------- |
| **Next.js** + **React** | Interface web e renderização da aplicação |
| **Tailwind CSS**        | Estilização responsiva                    |
| **TypeScript**          | Tipagem e escalabilidade do frontend      |
| **Docker**              | Containerização da aplicação              |

### Repositório do Frontend

> GitHub: https://github.com/DiegoG784/vaggo-web <br>
> Site: https://vaggo-web.vercel.app

---

### Equipe

| Membro                          | Responsabilidades                       |
| ------------------------------- | --------------------------------------- |
| **Henrique Porto de Sousa**     | Líder Backend e Desenvolvedor Backend   |
| **Diego Faria Amorim**          | Líder Frontend e Desenvolvedor Frontend |
| **Anthony Pires de Araujo**     | Desenvolvedor Full Stack                |
| **Moises dos Santos Cruz**      | Desenvolvedor Full Stack e QA           |
| **Guilherme Otavio dos Santos** | Documentação do projeto                 |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) e Docker Compose
- [PostgreSQL](https://www.postgresql.org/)
- Conta no [Cloudinary](https://cloudinary.com/)
- Chave da [Google Maps API](https://developers.google.com/maps)
- Conta no [Twilio](https://www.twilio.com/) (WhatsApp & SMS)
- Conta no [Neon](https://neon.com)
- Conta no [Render](https://render.com/)

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/henrique151/Vaggo
cd Vaggo/backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
# edite o .env com suas credenciais (veja a seção Variáveis de Ambiente)
```

### 4. Suba o banco de dados com Docker

```bash
docker-compose up -d
```

### 5. Execute as migrations

```bash
npx sequelize-cli db:migrate
```

### 6. Execute as seeds do banco de dados

```bash
npx sequelize-cli db:seed:all
```

### 7. Inicie o servidor

```bash
# desenvolvimento
npm run dev

# produção
npm run build && npm start
```

---

## Scripts

| Comando | Descrição |
| ------- | --------- |
| `npm run dev` | Inicia o servidor em modo desenvolvimento com reload automático via `ts-node-dev`. |
| `npm run build` | Compila o TypeScript para `dist/` e copia arquivos JavaScript necessários. |
| `npm start` | Executa a versão compilada em `dist/server.js`. |
| `npx sequelize-cli db:migrate` | Executa as migrations do banco de dados. |
| `npx sequelize-cli db:seed:all` | Executa os seeders do banco de dados. |

> No momento, o `package.json` não possui scripts `lint` ou `test` configurados.

---

## Variáveis de Ambiente

Copie o `.env.example` e preencha com suas credenciais:

```bash
cp .env.example .env
```

```env
# Servidor
PORT=3000

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=vaggo

# JWT
JWT_SECRET=seu_jwt_secret
JWT_ACCESS_TOKEN_EXPIRES=600    # 10 minutos (em segundos)
JWT_REFRESH_TOKEN_EXPIRES=604800 # 7 dias (em segundos)

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Twilio (WhatsApp / OTP)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Templates Twilio (WhatsApp)
TWILIO_TEMPLATE_RENTAL_REJECTED=
TWILIO_TEMPLATE_SPOT_APPROVED=
TWILIO_TEMPLATE_EMAIL_VERIFICATION=
TWILIO_TEMPLATE_OTP=
TWILIO_TEMPLATE_RENTAL=
TWILIO_TEMPLATE_CHAT=
TWILIO_TEMPLATE_APPROVED=

# EmailJS
EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
FRONTEND_URL=http://localhost:3001

# Api do Neon
DATABASE_URL=
```

---

## Documentação e Testes da API

### Swagger (Interface Gráfica)

A especificação da API foi desenvolvida em formato **YAML**. Você pode visualizar as rotas, parâmetros e testar os endpoints diretamente pelo navegador.

**Documentação Online:**
https://vaggo.onrender.com/api-docs/

**Execução Local:**

1. Inicie o servidor localmente (`npm run dev`).
2. Acesse a URL: `http://localhost:3000`

### Massa de Testes (Insomnia / Bruno / Postman)

Disponibilizamos o arquivo de histórico de requisições da API em formato **.har** para facilitar os testes de integração.

1. Na raiz do projeto, localize o arquivo: [`api_requests.har`](./api_requests.har)
2. Abra o seu cliente de API favorito (**Insomnia**, **Postman** ou **Bruno**).
3. Vá em **Importar (Import)** e selecione o arquivo `.har`.
4. Todas as requisições de cadastro, login, rotas de administrador e proprietário serão carregadas automaticamente com os corpos (payloads) de teste prontos.

---

> **Importante**
>
> Para utilizar as funcionalidades de cadastro e autenticação via WhatsApp, é necessário registrar o número no ambiente de testes do Twilio.
>
> Envie uma mensagem para:
>
> **+1 (415) 523-8886**
>
> Com o texto:
>
> ```text
> join driver-major
> ```
>
> Após a confirmação do Twilio, você receberá uma mensagem de validação e poderá realizar o cadastro normalmente no sistema.
---

## Estrutura de Pastas

```bash
backend
├── src/
│   ├── config/           # Configurações (DB, Cloudinary, Twilio, etc.)
│   ├── controllers/      # Handlers de request/response (finos, sem lógica)
│   ├── database/         # Migrations, seeders e conexão Sequelize
│   ├── middlewares/      # Auth JWT, validação Zod, error handler global
│   ├── models/           # Models Sequelize
│   ├── routes/           # Definição e agrupamento das rotas
│   ├── schemas/          # Schemas Zod por domínio
│   ├── services/         # Lógica de negócio
│   ├── types/            # Tipagens globais e augmentations do Express
│   ├── utils/            # Funções utilitárias (haversine, bitmask, etc.)
│   └── server.ts         # Entry point da aplicação
├── dist/                 # Build de produção (gerado)
├── .env.example          # Modelo de variáveis de ambiente
├── .sequelizerc          # Configuração de paths do Sequelize CLI
├── docker-compose.yml    # Serviços Docker (PostgreSQL)
├── Dockerfile
├── tsconfig.json
└── package.json
```

---

## Rotas da API

### Auth

| Método | Rota                            | Descrição                                                | Auth |
| ------ | ------------------------------- | -------------------------------------------------------- | ---- |
| `POST` | `/auth/login`                   | Login e geração de access token + refresh token (cookie) | —    |
| `POST` | `/auth/logout`                  | Logout e invalidação do token                            | ✅   |
| `POST` | `/auth/refresh`                 | Renova o access token via refresh token                  | —    |
| `POST` | `/auth/register/confirm`        | Confirma o código de verificação enviado no cadastro     | —    |
| `POST` | `/auth/register/resend`         | Reenvio do código de verificação                         | —    |
| `POST` | `/auth/forgot-password`         | Solicita o fluxo de recuperação de senha                 | —    |
| `POST` | `/auth/forgot-password/confirm` | Valida o código de recuperação de senha                  | —    |
| `POST` | `/auth/forgot-password/reset`   | Redefine a senha com o token de reset                    | —    |

### Usuários

| Método   | Rota         | Descrição                                                        | Auth |
| -------- | ------------ | ---------------------------------------------------------------- | ---- |
| `POST`   | `/users/`    | Cadastro de novo usuário (`multipart/form-data`)                 | —    |
| `GET`    | `/users/:id` | Buscar perfil de usuário por ID                                  | ✅   |
| `PUT`    | `/users/:id` | Atualizar perfil (`multipart/form-data`: name, phone, avatarUrl) | ✅   |
| `DELETE` | `/users/:id` | Deletar conta                                                    | ✅   |

### Veículos

| Método   | Rota                    | Descrição                                       | Auth |
| -------- | ----------------------- | ----------------------------------------------- | ---- |
| `POST`   | `/vehicles/`            | Cadastrar novo veículo                          | ✅   |
| `GET`    | `/vehicles/my-vehicles` | Listar todos os veículos do usuário autenticado | ✅   |
| `GET`    | `/vehicles/:id`         | Detalhes de um veículo por ID                   | ✅   |
| `PUT`    | `/vehicles/:id`         | Atualizar dados do veículo                      | ✅   |
| `DELETE` | `/vehicles/:id`         | Remover veículo                                 | ✅   |

> **Body (POST/PUT):** `brand`, `model`, `color`, `licensePlate`, `manufactureYear`, `type` (`CARRO` \| `MOTO`), `size` (`PEQUENO` \| `MEDIO` \| `GRANDE`)

### Localidades

| Método | Rota                                | Descrição                   | Auth |
| ------ | ----------------------------------- | --------------------------- | ---- |
| `GET`  | `/locations/states/`                | Listar todos os estados     | —    |
| `GET`  | `/locations/states/:stateId/cities` | Listar cidades de um estado | —    |

### Propriedades

| Método   | Rota                        | Descrição                                                               | Auth |
| -------- | --------------------------- | ----------------------------------------------------------------------- | ---- |
| `POST`   | `/properties/`              | Cadastrar nova propriedade (`multipart/form-data`)                      | ✅   |
| `GET`    | `/properties/`              | Listar todas as propriedades                                            | —    |
| `GET`    | `/properties/:id`           | Listar uma propriedade pelo ID                                          | ✅   |
| `GET`    | `/properties/my-properties` | Listar propriedades do usuário autenticado                              | ✅   |
| `PUT`    | `/properties/:id`           | Atualizar propriedade (`multipart/form-data`, suporta `imagesToRemove`) | ✅   |
| `DELETE` | `/properties/:id`           | Remover propriedade                                                     | ✅   |

> **Body (POST):** `name`, `type`, `description`, `totalCapacity`, `zipCode`, `number`, `complement`, `images[]` (arquivos)

### Vagas

| Método   | Rota                                          | Descrição                                                   | Auth |
| -------- | --------------------------------------------- | ----------------------------------------------------------- | ---- |
| `POST`   | `/spots/properties/:propertyId/spots`         | Gerar vagas para uma propriedade (`multipart/form-data`)    | ✅   |
| `GET`    | `/spots/properties/:propertyId/spots`         | Listar vagas de uma propriedade                             | ✅   |
| `PUT`    | `/spots/properties/:propertyId/spots/:spotId` | Atualizar dados de uma vaga                                 | ✅   |
| `PATCH`  | `/spots/:id/status`                           | Alterar status da vaga (`DISPONIVEL`, `INDISPONIVEL`, etc.) | ✅   |
| `DELETE` | `/spots/properties/:propertyId/spots/:spotId` | Remover vaga                                                | ✅   |

> **Body (POST):** `count`, `size`, `price`, `isCovered`, `prefix`, `allowedVehicles[]`, `files[]`, `availability` (JSON: `startDate`, `endDate`, `weekdays` (bitmask), `startTime`, `endTime`)

### Reservas

| Método  | Rota                           | Descrição                                          | Auth |
| ------- | ------------------------------ | -------------------------------------------------- | ---- |
| `POST`  | `/reservations/`               | Criar nova reserva                                 | ✅   |
| `GET`   | `/reservations/`               | Listar reservas do usuário autenticado (locatário) | ✅   |
| `GET`   | `/reservations/owner/`         | Listar reservas recebidas (proprietário)           | ✅   |
| `GET`   | `/reservations/search/address` | Buscar vagas disponíveis por endereço/CEP e datas  | —    |
| `PATCH` | `/reservations/:id/approve`    | Aprovar reserva (proprietário)                     | ✅   |
| `PATCH` | `/reservations/:id/reject`     | Rejeitar reserva (proprietário)                    | ✅   |

> **Query params (search):** `address` ou `cep`, `startDate`, `endDate`

> **Body (POST):** `spotId`, `vehicleId`, `startDate`, `endDate`

### Chat

| Método   | Rota                                   | Descrição                                       | Auth |
| -------- | -------------------------------------- | ----------------------------------------------- | ---- |
| `GET`    | `/chats`                               | Listar conversas do usuário com última mensagem | ✅   |
| `GET`    | `/chats/:id?page=1&limit=30`           | Abrir conversa com histórico paginado           | ✅   |
| `POST`   | `/chats/:id/messages`                  | Enviar mensagem (texto e/ou imagem)             | ✅   |
| `PUT`    | `/chats/messages/:id`                  | Editar mensagem própria                         | ✅   |
| `DELETE` | `/chats/messages/:id`                  | Soft delete de mensagem (para ambos)            | ✅   |
| `POST`   | `/chats/delete-multiple`               | Ocultar conversas apenas para o usuário logado  | ✅   |
| `DELETE` | `/chats/:id/for-everyone`              | Ocultar conversa para ambos os participantes    | ✅   |
| `GET`    | `/chats/:id/search?q=&page=1&limit=20` | Buscar mensagens dentro da conversa             | ✅   |
| `POST`   | `/chats/block`                         | Bloquear usuário                                | ✅   |
| `DELETE` | `/chats/block/:userId`                 | Desbloquear usuário                             | ✅   |

### Denúncias

| Método  | Rota                      | Descrição                                       | Auth |
| ------- | ------------------------- | ----------------------------------------------- | ---- |
| `POST`  | `/reports/`               | Registrar nova denúncia (`multipart/form-data`) | ✅   |
| `GET`   | `/reports/my`             | Listar minhas denúncias                         | ✅   |
| `PATCH` | `/reports/:id/reanalysis` | Solicitar reanálise de uma denúncia             | ✅   |

> **Body (POST):** `reportedUserId`, `targetType` (`CHAT` \| `SPOT`), `targetId`, `reason`, `images[]`

### Avaliações

| Método   | Rota                      | Descrição                                       | Auth |
| -------- | ------------------------- | ----------------------------------------------- | ---- |
| `POST`   | `/reviews`                | Registrar avaliação de uma reserva              | ✅   |
| `GET`    | `/reviews/my`             | Listar minhas avaliações                        | ✅   |
| `GET`    | `/reviews/properties/:id` | Avaliações públicas de uma propriedade          | ✅   |
| `GET`    | `/reviews/spots/:id`      | Avaliações públicas de uma vaga (retorna média) | ✅   |
| `PUT`    | `/reviews/:id`            | Atualizar avaliação                             | ✅   |
| `DELETE` | `/reviews/:id`            | Remover avaliação                               | ✅   |

> **Body (POST):** `reservationId`, `rating` (1–5), `comment`

---

### Admin

> Todas as rotas abaixo exigem autenticação com role `ADMIN` ou `MANAGER`.

#### Usuários

| Método   | Rota                         | Descrição                                      |
| -------- | ---------------------------- | ---------------------------------------------- |
| `GET`    | `/admin/users`               | Listar todos os usuários                       |
| `GET`    | `/users/admin/search`        | Buscar usuários por `email`, `name` ou `phone` |
| `GET`    | `/admin/users/blocked/count` | Total de usuários bloqueados                   |
| `PUT`    | `/admin/users/:id`           | Atualizar dados de um usuário                  |
| `PATCH`  | `/admin/users/:id/block`     | Bloquear ou desbloquear usuário                |
| `DELETE` | `/admin/users/:id`           | Deletar conta de usuário                       |

#### Veículos

| Método   | Rota                     | Descrição                 |
| -------- | ------------------------ | ------------------------- |
| `GET`    | `/admin/vehicles`        | Listar todos os veículos  |
| `GET`    | `/admin/vehicles/search` | Buscar por `licensePlate` |
| `GET`    | `/admin/vehicles/:id`    | Detalhes de um veículo    |
| `PUT`    | `/admin/vehicles/:id`    | Atualizar veículo         |
| `DELETE` | `/admin/vehicles/:id`    | Deletar veículo           |

#### Propriedades

| Método   | Rota                       | Descrição                                       |
| -------- | -------------------------- | ----------------------------------------------- |
| `GET`    | `/admin/properties`        | Listar todas as propriedades                    |
| `GET`    | `/admin/properties/search` | Buscar por `id`, `name`, `email` ou `ownerName` |
| `GET`    | `/admin/properties/:id`    | Detalhes de uma propriedade                     |
| `PUT`    | `/admin/properties/:id`    | Atualizar propriedade                           |
| `DELETE` | `/admin/properties/:id`    | Deletar propriedade                             |

#### Vagas

| Método   | Rota                        | Descrição                                                                                |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `GET`    | `/admin/spots`              | Listar todas as vagas                                                                    |
| `GET`    | `/admin/spots/search`       | Buscar por `id` ou `status` (`PENDENTE`, `APROVADA`, `RECUSADA`)                         |
| `PATCH`  | `/admin/spots/:id/evaluate` | Aprovar ou recusar vaga (`status`, `rejectionReason`) / Ativar ou desativar (`isActive`) |
| `DELETE` | `/admin/spots/:id`          | Deletar vaga                                                                             |

#### Reservas

| Método   | Rota                                   | Descrição                            |
| -------- | -------------------------------------- | ------------------------------------ |
| `GET`    | `/admin/reservations`                  | Listar todas as reservas             |
| `GET`    | `/admin/reservations/search`           | Buscar por `id`, `email` ou `status` |
| `GET`    | `/admin/reservations/:id`              | Detalhes de uma reserva              |
| `PATCH`  | `/admin/reservations/:id/force-cancel` | Forçar cancelamento de reserva       |
| `DELETE` | `/reservations/:id`                    | Deletar reserva                      |

#### Denúncias

| Método  | Rota                        | Descrição                                                                         |
| ------- | --------------------------- | --------------------------------------------------------------------------------- |
| `GET`   | `/admin/reports`            | Listar todas as denúncias                                                         |
| `GET`   | `/admin/reports/search`     | Buscar por `id` ou `email`                                                        |
| `GET`   | `/admin/reports/:id`        | Detalhes de uma denúncia                                                          |
| `PATCH` | `/admin/reports/:id/status` | Atualizar status (`PENDENTE`, `EM_ANALISE`, `RESOLVIDA`, `RECUSADA`, `REANALISE`) |

#### Avaliações

| Método   | Rota                    | Descrição                  |
| -------- | ----------------------- | -------------------------- |
| `GET`    | `/admin/reviews`        | Listar todas as avaliações |
| `GET`    | `/admin/reviews/search` | Buscar por `id` ou `email` |
| `DELETE` | `/admin/reviews/:id`    | Deletar avaliação          |

#### Dashboard

| Método | Rota                     | Descrição                                    |
| ------ | ------------------------ | -------------------------------------------- |
| `GET`  | `/admin/dashboard/stats` | Estatísticas e métricas gerais da plataforma |

---

## Autenticação

A API utiliza **JWT (JSON Web Token)**. Após o login, inclua o access token no header de todas as rotas protegidas:

```http
Authorization: Bearer <access_token>
```

O **refresh token** é armazenado via `httpOnly cookie` e utilizado na rota `/auth/refresh` para renovar o access token sem necessidade de novo login.

---

## Próximas Melhorias

Atualmente o backend ainda não possui testes automatizados implementados. Como próximos passos para a evolução do projeto, estão previstas as seguintes melhorias:

* Implementação de testes unitários e de integração para aumentar a confiabilidade da aplicação.
* Substituição da integração com o Twilio pela API do WhatsApp da Meta.
* Adição da validação de e-mail no processo de cadastro utilizando Gmail e EmailJS.
* Ampliação das validações e regras de negócio relacionadas a reservas, vagas e permissões de usuários.

Essas melhorias têm como objetivo tornar o sistema mais robusto, seguro e preparado para futuras evoluções.

---

## Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m "feat: minha feature"`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um Pull Request

### Git Branch & Pull Request Guidelines

**Branch Naming Convention:**
- `feat/feature-name` (New features)
- `fix/bug-name` (Bug fixes)
- `chore/task-name` (Maintenance, dependencies, etc.)
- `docs/doc-name` (Documentation updates)

**Pull Request Template:**
When submitting a Pull Request, please copy and use the following template (in English):

```markdown
## Description
<!-- Provide a brief description of the changes introduced by this PR. -->

## Motivation and Context
<!-- Why is this change required? What problem does it solve? -->

## Types of changes
<!-- What types of changes does your code introduce? Put an `x` in all the boxes that apply: -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Checklist:
<!-- Go over all the following points, and put an `x` in all the boxes that apply. -->
- [ ] My code follows the code style of this project.
- [ ] My change requires a change to the documentation.
- [ ] I have updated the documentation accordingly.
- [ ] I have read the **CONTRIBUTING** document.
```

---

<p align="center">
  Projeto Integrador · FATEC Zona Leste · DSM
</p>
