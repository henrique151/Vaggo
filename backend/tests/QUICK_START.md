# 🚀 QUICK START - Como Fazer o Teste Agora

## ⏱️ Tempo Total: ~15 minutos

---

## 📝 Passo 1: Preparação (2 min)

### Abra 2 Terminais

**Terminal 1 - Servidor:**

```bash
cd backend
npm run dev
```

Você deve ver:

```
Banco conectado
Server running on port 3000
```

**Terminal 2 - Testes:**

```bash
# Vamos executar os testes via curl
```

---

## 🔑 Passo 2: Fazer Login (2 min)

No Terminal 2, copie e execute:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@example.com",
    "password": "sua_senha"
  }'
```

**Resposta esperada:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGc...",
    "user": { "id": 1, "email": "seu_email@example.com" }
  }
}
```

**COPIE O TOKEN** (aquele `eyJhbGc...`) e salve em um bloco de notas.

---

## 📸 Passo 3: Preparar Imagens (3 min)

Você precisa de 1-3 arquivos de imagem (JPG, PNG).

**Opção A: Usar imagens existentes**

```bash
# Se tiver imagens
-F "files=@/caminho/para/imagem1.jpg" \
-F "files=@/caminho/para/imagem2.jpg" \
-F "files=@/caminho/para/imagem3.jpg"
```

**Opção B: Baixar uma imagem teste**

```bash
# No Windows
curl -o C:\temp\test.jpg https://via.placeholder.com/800x600
```

---

## 🏠 Passo 4: Criar Propriedade (3 min) - ⚠️ OPERAÇÃO MAIS IMPORTANTE

**Cole isso no Terminal 2, substituindo:**

- `SEU_TOKEN_AQUI` → seu token do passo 2
- `/caminho/para/` → caminho real das imagens

```bash
curl -X POST http://localhost:3000/properties \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "title=Apartamento Teste" \
  -F "type=APARTMENT" \
  -F "price=2500" \
  -F "bedroomCount=2" \
  -F "bathroomCount=1" \
  -F "area=85" \
  -F "description=Teste de performance" \
  -F "zipCode=01310100" \
  -F "street=Avenida Paulista" \
  -F "number=1000" \
  -F "complement=Apto 500" \
  -F "neighborhood=Bela Vista" \
  -F "files=@/caminho/para/imagem1.jpg" \
  -F "files=@/caminho/para/imagem2.jpg" \
  -F "files=@/caminho/para/imagem3.jpg"
```

**No Terminal 1 (servidor):**

Você verá MUITOS logs. Procure por estas linhas:

```
[TOTAL] POST /properties: 4523.15ms          ← TEMPO TOTAL DA REQUISIÇÃO
TOTAL-CREATE-PROPERTY: 4521.34ms             ← TEMPO NO CONTROLLER

CREATE-PROPERTY-TOTAL: 4521.34ms             ← TEMPO NA SERVICE
1-VALIDATE-FILES: 0.12ms
2-TRANSACTION-START: 5.67ms
3-EXTERNAL-API-CEP: 234.56ms    ← API de CEP
4-FIND-CITY: 12.34ms
5-CREATE-ADDRESS: 45.67ms
6-CREATE-PROPERTY: 23.45ms
7-CREATE-PROPERTY-USER: 15.23ms
8-UPLOAD-IMAGES: 4012.34ms      ← 🔴 AQUI? Este é o gargalo!
  8.1-UPLOAD-IMAGE-1: 1345.67ms
  8.2-UPLOAD-IMAGE-2: 1223.45ms
  8.3-UPLOAD-IMAGE-3: 1443.22ms
9-UPDATE-PROPERTY-IMAGES: 8.90ms
10-TRANSACTION-COMMIT: 12.34ms
11-FETCH-COMPLETE-PROPERTY: 123.45ms

[QUERY-TIME] 45ms - SELECT...   ← Queries SQL
[QUERY-TIME] 78ms - SELECT...
```

**COPIE TODO ESTE OUTPUT** (Ctrl+C no Terminal 1 para parar se necessário)

---

## 📊 Passo 5: Analisar (5 min)

### Procure por:

#### ✅ Operações Normais

- Validação: < 10ms
- Transações: < 10ms
- Queries DB: < 100ms
- API CEP: 200-500ms (esperado)

#### ⚠️ Operações Lentas

- `UPLOAD-IMAGES` > 3s: **PROBLEMA!**
- `GET-ALL` > 1s: **N+1 Queries**
- Queries > 500ms: **Sem índice**

---

## 🎯 Resumo Visual

```
CENÁRIO 1: Upload está lento ❌
┌─────────────────────────┐
│ TOTAL: 4500ms           │
│ ├─ Upload: 4000ms (89%) │ ⬅️ GARGALO!
│ ├─ CEP API: 200ms       │
│ ├─ DB Queries: 150ms    │
│ └─ Outros: 150ms        │
└─────────────────────────┘

SOLUÇÃO: Paralelizar uploads (Promise.all)
Resultado esperado: 4.5s → 1.5s

─────────────────────────

CENÁRIO 2: Muitas queries ❌
┌─────────────────────────┐
│ TOTAL: 2000ms           │
│ ├─ DB Queries: 1800ms (90%) │ ⬅️ GARGALO!
│ ├─ Upload: 100ms        │
│ └─ Outros: 100ms        │
└─────────────────────────┘

SOLUÇÃO: Eager loading (include corretamente)
Resultado esperado: 2.0s → 0.5s
```

---

## 📋 Template para Reportar o Gargalo

Copie, preencha e envie:

```
╔════════════════════════════════════════╗
║  TESTE DE PERFORMANCE - RESULTADO      ║
╚════════════════════════════════════════╝

DATA: [hoje]
ROTA: POST /properties

⏱️ TEMPO TOTAL: [cole aqui]ms

🔍 BREAKDOWN:
- Upload Imagens: [X]ms ([%]%)
- API CEP: [X]ms ([%]%)
- DB Queries: [X]ms ([%]%)
- Outros: [X]ms ([%]%)

🔴 GARGALO IDENTIFICADO:
[Operation] toma [X]ms

📝 HIPÓTESE:
[Sua análise]

💡 SOLUÇÃO PROPOSTA:
1. [Solução 1]
2. [Solução 2]

Próximos passos: Implementar solução
```

---

## 🔗 Testes Adicionais (Opcional)

### Testar GET ALL Properties

```bash
curl -X GET http://localhost:3000/properties \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Tempo esperado: < 500ms

### Testar GET MY Properties

```bash
curl -X GET http://localhost:3000/properties/my \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Tempo esperado: < 500ms

### Testar UPDATE Property

```bash
curl -X PUT http://localhost:3000/properties/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apartamento Updated",
    "price": 3000,
    "bedroomCount": 3,
    "zipCode": "01310100",
    "street": "Avenida Paulista",
    "number": 1000,
    "neighborhood": "Bela Vista"
  }'
```

---

## 🆘 Troubleshooting

### ❌ "Authorization header required"

- [ ] Você copiu o token corretamente?
- [ ] Token ainda é válido? (máx 3h)

### ❌ "PROPERTY_IMAGE_LIMIT"

- [ ] Você mandou mais de 3 imagens?
- [ ] Remova uma

### ❌ "EXTERNAL_API_FAILURE"

- [ ] CEP válido? (01310100 é São Paulo)
- [ ] Internet funcionando?

### ❌ Nenhum log aparecendo

- [ ] npm run dev está realmente rodando?
- [ ] A porta 3000 não está bloqueada?

---

## ✅ Próximos Passos

1. **Execute o CREATE Property** → Cole os logs aqui
2. **Identifique o gargalo** → Qual operação > 1s?
3. **Implemente a solução** → Segundo o ANALYSIS_GUIDE.md
4. **Teste novamente** → Compare antes vs. depois

---

## 📚 Documentação

- **README.md** → Guia completo de todas as rotas
- **ANALYSIS_GUIDE.md** → Como analisar e otimizar
- **curl_tests.sh** → Script automatizado (Linux/Mac)
- **properties_collection.json** → Importar no Postman/Insomnia

---

## 🎯 Conclusão

Agora você tem:
✅ Logging detalhado em TODAS as rotas  
✅ Instruções passo-a-passo para testar  
✅ Guia de análise de gargalos  
✅ Soluções propostas para cada problema

**Execute o teste AGORA e copie o output dos logs aqui! 🚀**
