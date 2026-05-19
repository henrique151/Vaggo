# 🔍 Guia de Análise de Gargalos - Properties API

## 📊 Onde Procurar o Problema

Após executar cada teste, verifique **o console do servidor** para encontrar os timestamps de cada operação.

---

## 🎯 Exemplo de Output Esperado + Análise

### Cenário: CREATE Property (POST /properties)

**Console Output:**

```
[TOTAL] POST /properties: 5432.15ms                    ← TEMPO TOTAL
TOTAL-CREATE-PROPERTY: 5421.34ms
1-PARSE-REQUEST: 1.23ms
2-PROPERTY-SERVICE: 5420.11ms

[QUERY] SELECT COUNT(*) FROM users WHERE id = 1
[QUERY-TIME] 45ms - SELECT COUNT(*) FROM users WHERE id = 1

CREATE-PROPERTY-TOTAL: 5421.34ms
1-VALIDATE-FILES: 0.12ms                              ✅ OK
2-TRANSACTION-START: 5.67ms                           ✅ OK
3-EXTERNAL-API-CEP: 234.56ms                          ✅ OK (esperado ~200-500ms)
4-FIND-CITY: 12.34ms                                  ✅ OK
5-CREATE-ADDRESS: 45.67ms                             ✅ OK
6-CREATE-PROPERTY: 23.45ms                            ✅ OK
7-CREATE-PROPERTY-USER: 15.23ms                       ✅ OK
8-UPLOAD-IMAGES: 4567.89ms                            ⚠️ PROBLEMA!
  8.1-UPLOAD-IMAGE-1: 1523.45ms                       ❌ MUITO LENTO
  8.2-UPLOAD-IMAGE-2: 1567.23ms                       ❌ MUITO LENTO
  8.3-UPLOAD-IMAGE-3: 1477.21ms                       ❌ MUITO LENTO
9-UPDATE-PROPERTY-IMAGES: 8.90ms                      ✅ OK
10-TRANSACTION-COMMIT: 12.34ms                        ✅ OK
11-FETCH-COMPLETE-PROPERTY: 123.45ms                  ⚠️ Um pouco lento

[QUERY-TIME] 45ms - SELECT * FROM properties WHERE id = 1
[QUERY-TIME] 78ms - SELECT * FROM addresses WHERE id = 5
[QUERY-TIME] 23ms - SELECT * FROM cities WHERE id = 1
```

---

## 🔴 Problemas Identificados e Soluções

### 🔴 Problema #1: Upload de Imagens Muito Lento

**Sintoma:**

```
8-UPLOAD-IMAGES: 4567.89ms
  8.1-UPLOAD-IMAGE-1: 1523.45ms  ← 1.5s POR IMAGEM
```

**Causas Possíveis:**

1. Imagens não comprimidas (arquivo grande demais)
2. API Cloudinary lenta ou com limite atingido
3. Network latency (cloud provider lento)
4. Upload sequencial em vez de paralelo

**Soluções (em ordem de impacto):**

**Solução A: Paralelizar Uploads** (Rápido, Alto Impacto)

```typescript
// ANTES (sequencial = lento)
for (let i = 0; i < files.length; i++) {
    await ImageService.uploadPropertyImage(...);  // Espera 1.5s
}
// Total: 3 × 1.5s = 4.5s

// DEPOIS (paralelo = rápido)
await Promise.all(
    files.map((file, i) =>
        ImageService.uploadPropertyImage(file, userId, propertyId, i)
    )
);
// Total: ~1.5s (apenas a mais lenta)
```

**Solução B: Comprimir Imagens** (Médio Impacto)

```typescript
// Reduzir tamanho da imagem antes do upload
// Ex: 5MB → 500KB reduz tempo em ~80%

import sharp from "sharp";

const compressed = await sharp(file.buffer)
  .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toBuffer();
```

**Solução C: Usar Background Worker** (Complexo, Alto Impacto)

- Retornar imagem com `status: "pending"`
- Upload acontece em background (Bull/RabbitMQ)
- Frontend pega URL quando pronta

---

### 🔴 Problema #2: API de CEP Lenta

**Sintoma:**

```
3-EXTERNAL-API-CEP: 1234.56ms  ← > 1 segundo
```

**Solução A: Implementar Cache**

```typescript
// Usar Redis ou Node-Cache
const cache = new Map();

async function getAddressByCep(cep) {
  if (cache.has(cep)) {
    console.log("CACHE HIT");
    return cache.get(cep);
  }

  const result = await externalApi(cep);
  cache.set(cep, result); // 5 min TTL
  return result;
}
```

**Impacto:** Reduz de 1.2s → 0.5ms no segundo request!

---

### 🔴 Problema #3: Query N+1 (GET MY PROPERTIES)

**Sintoma:**

```
GET-MY-PROPERTIES-TOTAL: 5600.23ms

[QUERY-TIME] 234ms - SELECT * FROM properties WHERE userId = 1
[QUERY-TIME] 45ms - SELECT * FROM addresses WHERE id = 1
[QUERY-TIME] 45ms - SELECT * FROM addresses WHERE id = 2  ← Repetida!
[QUERY-TIME] 45ms - SELECT * FROM addresses WHERE id = 3  ← Repetida!
```

**Problema:** Para cada propriedade, faz query separada de address!

**Solução: Usar Eager Loading**

```typescript
// ANTES (N+1 problem)
const properties = await Property.findAll({
  where: { userId },
});
// Depois iteraria cada uma consultando addresses

// DEPOIS (Eager loading)
const properties = await Property.findAll({
  where: { userId },
  include: [
    {
      model: Address,
      as: "address",
      include: [{ model: City, as: "city" }],
    },
  ],
});
// Só 1 query com JOIN!
```

---

### 🟡 Problema #4: Sem Índice no PostgreSQL

**Sintoma:**

```
[QUERY-TIME] 523ms - SELECT * FROM properties WHERE email = 'test@email.com'
```

Muito lento pra busca simples?

**Solução:**

```sql
-- Criar índice no banco
CREATE INDEX idx_properties_userId ON properties(userId);
CREATE INDEX idx_addresses_cityId ON addresses(cityId);
CREATE INDEX idx_users_email ON users(email);

-- Verificar se está usando índice
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM properties WHERE userId = 1;
-- Deve mostrar "Index Scan" não "Seq Scan"
```

---

## 📋 Checklist: Diagnosticar Seu Gargalo

1. **Rodar CREATE Property** → Verificar tempo total
   - [ ] < 2s = ✅ Excelente
   - [ ] 2-5s = ⚠️ OK, mas otimizável
   - [ ] > 5s = 🔴 Crítico

2. **Procurar pelos logs**

   ```bash
   npm run dev 2>&1 | grep "ms"
   ```

   Procure por valores > 1000ms

3. **Identificar a operação mais lenta**
   - Se `8-UPLOAD-IMAGES` > 3s → Paralelizar uploads
   - Se `3-EXTERNAL-API-CEP` > 1s → Adicionar cache
   - Se `11-FETCH-COMPLETE-PROPERTY` > 500ms → N+1 queries?

4. **Confirmar com EXPLAIN ANALYZE**
   ```bash
   docker exec -it postgres-container psql -U postgres -d vaggo
   EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM properties WHERE userId = 1;
   ```

---

## 🎯 Template de Análise (Preencher após testar)

```
DATA DO TESTE: [Data]
ROTA TESTADA: POST /properties
TEMPO TOTAL: 4523ms

BREAKDOWN:
- Parse Request: 1ms (0.02%)
- Service Call: 4522ms (99.98%)
  ├─ Validate Files: 0.12ms
  ├─ Transaction Start: 5.67ms
  ├─ External API CEP: 234.56ms (5%)
  ├─ Find City: 12.34ms
  ├─ Create Address: 45.67ms
  ├─ Create Property: 23.45ms
  ├─ Create Property User: 15.23ms
  ├─ Upload Images: 4012.34ms (89%) ⬅️ GARGALO
  ├─ Update Property Images: 8.90ms
  ├─ Transaction Commit: 12.34ms
  └─ Fetch Complete Property: 123.45ms

PROBLEMA IDENTIFICADO:
Upload de imagens no Cloudinary está tomando 89% do tempo total (4.0s)
Cada imagem leva ~1.3s, e estamos fazendo upload sequencial de 3.

CAUSA PROVÁVEL:
1. Imagens não comprimidas (~5MB cada)
2. Upload sequencial em vez de paralelo
3. Cloudinary pode estar com limite de band

SOLUÇÃO RECOMENDADA:
1. Paralelizar uploads (Promise.all) = reduz 4s → 1.5s
2. Comprimir imagens (Sharp) = reduz 1.5s → 0.5s
3. Total esperado: 4.5s → ~2s (55% de redução!)

PRÓXIMO PASSO:
Implementar Promise.all no ImageService.uploadPropertyImage()
```

---

## 🔗 Comandos Úteis

### Ver todos os logs com tempo

```bash
npm run dev 2>&1 | grep -E "\[QUERY-TIME\]|TOTAL|ms"
```

### Salvar logs em arquivo

```bash
npm run dev > logs.txt 2>&1
```

### Monitorar em tempo real

```bash
npm run dev 2>&1 | grep "UPLOAD"
```

### Testar latência com banco

```bash
docker exec postgres-container pg_stat_statements
```

---

## 💡 Dicas Finais

1. **Sempre medir antes de otimizar**
   - Os logs mostram EXATAMENTE onde está o problema
   - Não chute! Use dados

2. **Priorize por impacto**
   - Otimizar algo que toma 1% do tempo = 1% de melhoria
   - Otimizar algo que toma 89% = máximo impacto

3. **Test após cada mudança**
   - Refaça os testes
   - Compare antes vs. depois
   - Documente as mudanças

4. **Comunicar os resultados**
   - Mostrar tempo ANTES e DEPOIS
   - Ex: "4.5s → 2.0s (55% mais rápido)"

---

## ❓ Exemplo de Relatório Final

```
🚀 OTIMIZAÇÃO CONCLUÍDA

Problema: POST /properties levava 4.5s (89% em upload de imagens)

Solução Implementada:
✅ Paralelizar uploads com Promise.all
✅ Comprimir imagens com Sharp antes do upload

Resultados:
- ANTES: 4.5s
- DEPOIS: 1.8s
- Melhoria: 60% mais rápido ⚡

Código:
github.com/user/repo/commit/abc123
```

---

Pronto! Agora você tem uma metodologia científica para debugar e otimizar sua API! 🎯
