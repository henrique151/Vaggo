# Guia de Testes - Properties API

## 📋 Sobre

Este guia contém instruções para testar todas as rotas da API de propriedades com logging detalhado de performance. Cada rota terá timestamps mostrando exatamente onde está o gargalo.

## 🚀 Como Rodar os Testes

### Pré-requisitos

1. **Servidor rodando**: `npm run dev` (terminal 1)
2. **Banco de dados** PostgreSQL rodando no Docker
3. **Token JWT válido** para autenticação

### Passo 1: Obter Token de Autenticação

Primeiro, crie um usuário e faça login para obter o token:

```bash
# POST /users/login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGc...",
    "expiresIn": 10800,
    "user": { "id": 1, "email": "teste@example.com" }
  }
}
```

**Guarde o `token`** - você precisará dele em todas as requisições autenticadas.

---

## 📍 Rotas de Properties

### 1️⃣ **CREATE PROPERTY** (POST /properties)

Cria uma nova propriedade com até 3 imagens.

**Importante**: Esta é a rota MAIS LENTA (deve ser a primeira a analisar).

```bash
# Prepare 1-3 arquivos de imagem (JPG/PNG)

curl -X POST http://localhost:3000/properties \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "title=Apartamento Bela Vista" \
  -F "type=APARTMENT" \
  -F "price=2500" \
  -F "bedroomCount=2" \
  -F "bathroomCount=1" \
  -F "area=85" \
  -F "description=Apartamento bonito, bem localizado" \
  -F "zipCode=01310100" \
  -F "street=Avenida Paulista" \
  -F "number=1000" \
  -F "complement=Apto 500" \
  -F "neighborhood=Bela Vista" \
  -F "files=@/caminho/para/imagem1.jpg" \
  -F "files=@/caminho/para/imagem2.jpg" \
  -F "files=@/caminho/para/imagem3.jpg"
```

**Logs esperados no terminal:**

```
[TOTAL] POST /properties: 5432.15ms
TOTAL-CREATE-PROPERTY: 5421.34ms
1-PARSE-REQUEST: 1.23ms
2-PROPERTY-SERVICE: 5420.11ms

CREATE-PROPERTY-TOTAL: 5421.34ms
1-VALIDATE-FILES: 0.12ms
2-TRANSACTION-START: 5.67ms
3-EXTERNAL-API-CEP: 234.56ms  ⚠️ SUSPEITA: API externa lenta!
4-FIND-CITY: 12.34ms
5-CREATE-ADDRESS: 45.67ms
6-CREATE-PROPERTY: 23.45ms
7-CREATE-PROPERTY-USER: 15.23ms
8-UPLOAD-IMAGES: 4567.89ms  ⚠️ SUSPEITA: Upload de imagens MUITO LENTO!
  8.1-UPLOAD-IMAGE-1: 1523.45ms
  8.2-UPLOAD-IMAGE-2: 1567.23ms
  8.3-UPLOAD-IMAGE-3: 1477.21ms
9-UPDATE-PROPERTY-IMAGES: 8.90ms
10-TRANSACTION-COMMIT: 12.34ms
11-FETCH-COMPLETE-PROPERTY: 123.45ms
```

---

### 2️⃣ **GET ALL PROPERTIES** (GET /properties)

Busca todas as propriedades cadastradas.

```bash
curl -X GET http://localhost:3000/properties \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Logs esperados:**

```
[TOTAL] GET /properties: 456.78ms
TOTAL-GET-ALL-PROPERTIES: 450.23ms
1-FIND-ALL: 450.11ms

[QUERY-TIME] 450ms - SELECT * FROM properties...
```

---

### 3️⃣ **GET PROPERTY BY ID** (GET /properties/:id)

Busca uma propriedade específica.

```bash
curl -X GET http://localhost:3000/properties/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Logs esperados:**

```
[TOTAL] GET /properties/1: 234.56ms
TOTAL-GET-PROPERTY-BY-ID: 230.12ms
1-PARSE-REQUEST: 0.34ms
2-PROPERTY-SERVICE: 229.78ms

GET-PROPERTY-BY-ID-TOTAL: 230.12ms
1-FIND-PROPERTY: 123.45ms
2-CHECK-PERMISSION: 105.67ms
```

---

### 4️⃣ **GET MY PROPERTIES** (GET /properties/my)

Busca apenas as propriedades do usuário autenticado.

```bash
curl -X GET http://localhost:3000/properties/my \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Logs esperados:**

```
[TOTAL] GET /properties/my: 567.89ms
TOTAL-GET-MY-PROPERTIES: 560.23ms
1-PARSE-REQUEST: 0.45ms
2-PROPERTY-SERVICE: 559.78ms

GET-MY-PROPERTIES-TOTAL: 560.23ms
1-FIND-PROPERTIES: 559.89ms

[QUERY-TIME] 559ms - SELECT * FROM properties WHERE... (N+1 query problem?)
```

---

### 5️⃣ **UPDATE PROPERTY** (PUT /properties/:id)

Atualiza dados e/ou imagens de uma propriedade.

```bash
# Opção 1: Só atualizar dados (sem imagens)
curl -X PUT http://localhost:3000/properties/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apartamento Atualizado",
    "price": 2800,
    "bedroomCount": 3,
    "zipCode": "01310100",
    "street": "Avenida Paulista",
    "number": 1000,
    "neighborhood": "Bela Vista"
  }'

# Opção 2: Atualizar com novas imagens
curl -X PUT http://localhost:3000/properties/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "title=Apartamento Updated" \
  -F "price=2900" \
  -F "bedroomCount=2" \
  -F "zipCode=01310100" \
  -F "street=Avenida Paulista" \
  -F "number=1000" \
  -F "neighborhood=Bela Vista" \
  -F 'imagesToRemove=["https://cloudinary.com/..."]' \
  -F "files=@/caminho/para/nova-imagem.jpg"
```

**Logs esperados:**

```
[TOTAL] PUT /properties/1: 3456.78ms
TOTAL-UPDATE-PROPERTY: 3450.12ms

UPDATE-PROPERTY-TOTAL: 3450.12ms
2-FIND-PROPERTY: 45.67ms
3-EXTERNAL-API-CEP: 234.56ms
4-FIND-CITY: 12.34ms
5-FIND-PROPERTY-USER: 23.45ms
6-PROCESS-IMAGES: 1.23ms
7-UPLOAD-NEW-IMAGES: 2345.67ms  ⚠️ SUSPEITA: Upload lento novamente!
8-UPDATE-PROPERTY: 56.78ms
9-UPDATE-ADDRESS: 34.56ms
10-TRANSACTION-COMMIT: 12.34ms
11-DELETE-OLD-IMAGES: 234.56ms
12-FETCH-COMPLETE-PROPERTY: 145.67ms
```

---

### 6️⃣ **DELETE PROPERTY** (DELETE /properties/:id)

Deleta uma propriedade.

```bash
curl -X DELETE http://localhost:3000/properties/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Logs esperados:**

```
[TOTAL] DELETE /properties/1: 789.01ms
TOTAL-DELETE-PROPERTY: 780.23ms

DELETE-PROPERTY-TOTAL: 780.23ms
1-TRANSACTION-START: 5.67ms
2-FIND-PROPERTY: 12.34ms
3-FIND-PROPERTY-USER: 15.23ms
4-DESTROY-PROPERTY: 34.56ms
5-DESTROY-ADDRESS: 28.90ms
6-TRANSACTION-COMMIT: 8.90ms
7-DELETE-IMAGES-FOLDER: 678.34ms  ⚠️ SUSPEITA: Deletar imagens é lento!
```

---

## 🔍 Analisando os Logs

### Checklist de Gargalos

| Rota        | Operação                 | Tempo Esperado  | Tempo Anormal | Solução                            |
| ----------- | ------------------------ | --------------- | ------------- | ---------------------------------- |
| **CREATE**  | `3-EXTERNAL-API-CEP`     | <500ms          | >1s           | API de CEP lenta ou sem cache      |
| **CREATE**  | `8-UPLOAD-IMAGES`        | <3s para 3 imgs | >5s           | Cloudinary lento ou sem otimização |
| **GET ALL** | `1-FIND-ALL`             | <500ms          | >1s           | Sem índice na tabela properties    |
| **GET MY**  | `1-FIND-PROPERTIES`      | <500ms          | >2s           | N+1 queries no include             |
| **UPDATE**  | `7-UPLOAD-NEW-IMAGES`    | <3s             | >5s           | Mesmo problema do CREATE           |
| **DELETE**  | `7-DELETE-IMAGES-FOLDER` | <1s             | >2s           | Cloudinary deletion lento          |

---

## 🎯 Teste Recomendado (Ordem)

Execute na ordem para isolar problemas:

```bash
# Terminal 1: Monitorar logs
npm run dev

# Terminal 2: Executar testes
# 1. Criar propriedade (a mais lenta)
curl ... # CREATE

# 2. Esperar ~5s, ver todos os logs

# 3. Listar todas
curl ... # GET ALL

# 4. Buscar por ID
curl ... # GET BY ID

# 5. Buscar minhas
curl ... # GET MY

# 6. Atualizar
curl ... # UPDATE

# 7. Deletar
curl ... # DELETE
```

---

## 📊 Interpretando a Saída

### Exemplo Real: Gargalo Encontrado

```
CREATE-PROPERTY-TOTAL: 4523.45ms
├─ 1-VALIDATE-FILES: 0.12ms      ✅ OK
├─ 2-TRANSACTION-START: 5.67ms   ✅ OK
├─ 3-EXTERNAL-API-CEP: 234.56ms  ✅ OK (esperado)
├─ 4-FIND-CITY: 12.34ms          ✅ OK
├─ 5-CREATE-ADDRESS: 45.67ms     ✅ OK
├─ 6-CREATE-PROPERTY: 23.45ms    ✅ OK
├─ 7-CREATE-PROPERTY-USER: 15.23ms ✅ OK
├─ 8-UPLOAD-IMAGES: 4012.34ms    ⚠️ PROBLEMA!
│  ├─ 8.1-UPLOAD-IMAGE-1: 1345.67ms
│  ├─ 8.2-UPLOAD-IMAGE-2: 1223.45ms
│  └─ 8.3-UPLOAD-IMAGE-3: 1443.22ms
├─ 9-UPDATE-PROPERTY-IMAGES: 8.90ms ✅ OK
├─ 10-TRANSACTION-COMMIT: 12.34ms   ✅ OK
└─ 11-FETCH-COMPLETE-PROPERTY: 123.45ms ✅ LENTO (mas aceitável)

🔴 CONCLUSÃO: Upload de imagens no Cloudinary está lento (~1.3-1.4s por imagem)
```

---

## 🛠️ Soluções Possíveis

### Se `EXTERNAL-API-CEP` está lento (>1s):

- Implementar cache em Redis
- Usar batch requests se possível
- Verificar latência de rede: `ping api.cep.com`

### Se `UPLOAD-IMAGES` está lento (>3-5s):

- Compressar imagens antes do upload
- Usar workers de background
- Verificar limite de banda do Cloudinary
- Parallelizar uploads (Promise.all em vez de loop sequencial)

### Se `GET-ALL` / `GET-MY` está lento (>1s):

- Adicionar índices no PostgreSQL: `CREATE INDEX idx_properties_userId ON properties(userId)`
- Paginar resultados
- Lazy-load includes

### Se `DELETE-IMAGES-FOLDER` está lento (>2s):

- Async delete sem bloquear response
- Batch deletion no Cloudinary
- Implementar soft delete

---

## 📝 Modelo de Análise

Após rodar os testes, preencha este modelo:

```
ROTA TESTADA: POST /properties
TEMPO TOTAL: 4523ms

Breakdown:
- API CEP: 234ms (5%)
- Upload Imagens: 4012ms (89%) ⚠️ GARGALO
- Query DB: 120ms (3%)
- Misc: 157ms (3%)

PROBLEMA IDENTIFICADO:
Upload de imagens está 2x mais lento que esperado

PRÓXIMOS PASSOS:
1. Compressar imagens antes de enviar
2. Parallelizar uploads
3. Verificar limite de banda Cloudinary
```

---

## 🔗 Ferramentas Úteis

- **Postman**: Importar coleção em `./postman_collection.json`
- **Insomnia**: Importar em `./insomnia_collection.json`
- **curl/bash**: Scripts em `./curl_tests.sh`
- **Apache Bench**: `ab -n 100 -c 10 http://localhost:3000/properties`

---

## ❓ Dúvidas?

Veja os logs detalhados no console e compare com os tempos esperados acima.
