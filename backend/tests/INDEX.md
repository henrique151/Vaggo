# 📁 Pasta de Testes - Índice

## 📚 Arquivos Nesta Pasta

### 1. **QUICK_START.md** ⭐ COMECE AQUI!

- **Tempo:** 15 minutos
- **O quê:** Guia passo-a-passo para fazer o primeiro teste
- **Quem:** Qualquer pessoa que quer testar AGORA
- **Resultado:** Logs com os tempos exatos de cada operação

---

### 2. **README.md** 📖 GUIA COMPLETO

- **Tempo:** 30 minutos de leitura
- **O quê:** Documentação completa de todas as 6 rotas de properties
- **Inclui:**
  - Request/Response de cada rota
  - Logs esperados
  - Tempos normais vs. anormais
  - Checklist de gargalos comuns
  - Soluções para cada problema
- **Quem:** Developers que querem entender a estrutura

---

### 3. **ANALYSIS_GUIDE.md** 🔍 COMO OTIMIZAR

- **Tempo:** Depende do problema
- **O quê:** Guia profissional de debugging e otimização
- **Inclui:**
  - Exemplos reais de output
  - Problemas comuns + soluções
  - Código para cada solução
  - Template de análise
  - Comandos úteis
- **Quem:** Developers que já rodaram testes e querem otimizar

---

### 4. **curl_tests.sh** 🔧 SCRIPT DE TESTE (Linux/Mac)

- **Tempo:** Automático (~2 min)
- **O quê:** Script bash que executa todos os testes
- **Como usar:**
  ```bash
  chmod +x curl_tests.sh
  ./curl_tests.sh
  ```
- **Inclui:** Login → Create → GetAll → GetById → GetMy → Update → Delete
- **Nota:** Windows: Use Git Bash ou WSL

---

### 5. **properties_collection.json** 📮 IMPORTAR NO POSTMAN

- **O quê:** Coleção pronta para Postman/Insomnia/Thunder Client
- **Como usar:**
  1. Abra Postman
  2. Click "Import"
  3. Selecione este arquivo
  4. Todos os endpoints estarão prontos!
- **Inclui:** Login + 6 endpoints de properties

---

## 🚀 Fluxo Recomendado

### Primeira Vez (Iniciante)

```
1. Leia: QUICK_START.md
2. Execute: Os testes (passo 1-4)
3. Copie: Os logs do console
4. Cole: Aqui nos comentários/issue
5. Leia: README.md para entender melhor
```

### Otimizando (Desenvolvedor)

```
1. Rode: curl_tests.sh ou Postman collection
2. Identifique: Qual operação > 1s?
3. Leia: ANALYSIS_GUIDE.md para sua situação
4. Implemente: A solução recomendada
5. Teste: Novamente e compare antes/depois
6. Documente: A mudança no commit
```

---

## 🎯 O Que Esperar

### Cenário 1: Tudo OK ✅

```
TOTAL-CREATE-PROPERTY: 1523.45ms
├─ UPLOAD-IMAGES: 1200ms (78%)
├─ CEP-API: 234ms (15%)
└─ DB Operations: 89ms (7%)
```

**Decisão:** Não mexer, está bom!

### Cenário 2: Upload Lento ❌

```
TOTAL-CREATE-PROPERTY: 4567.89ms
├─ UPLOAD-IMAGES: 4012ms (88%) ⬅️ PROBLEMA
├─ CEP-API: 234ms (5%)
└─ DB Operations: 321ms (7%)
```

**Ação:** Paralelizar uploads (ver ANALYSIS_GUIDE.md)

### Cenário 3: Muitas Queries ❌

```
TOTAL-GET-ALL-PROPERTIES: 2345.67ms
├─ Query 1 (find properties): 234ms
├─ Query 2 (find addresses): 234ms ⬅️ Repetida!
├─ Query 3 (find addresses): 234ms ⬅️ Repetida!
└─ ...
```

**Ação:** Eager loading (ver ANALYSIS_GUIDE.md)

---

## 📊 Estrutura de Logs Esperada

Quando você roda um teste, verá algo assim no Terminal 1:

```
[TOTAL] POST /properties: 4523.15ms                 ← Express middleware
TOTAL-CREATE-PROPERTY: 4521.34ms                    ← Controller

CREATE-PROPERTY-TOTAL: 4521.34ms                    ← Service
1-VALIDATE-FILES: 0.12ms
2-TRANSACTION-START: 5.67ms
3-EXTERNAL-API-CEP: 234.56ms                        ← API call
4-FIND-CITY: 12.34ms
5-CREATE-ADDRESS: 45.67ms
6-CREATE-PROPERTY: 23.45ms
7-CREATE-PROPERTY-USER: 15.23ms
8-UPLOAD-IMAGES: 4012.34ms                          ← FILE upload
9-UPDATE-PROPERTY-IMAGES: 8.90ms
10-TRANSACTION-COMMIT: 12.34ms
11-FETCH-COMPLETE-PROPERTY: 123.45ms

[QUERY-TIME] 45ms - SELECT...                       ← DB Query
[QUERY-TIME] 78ms - SELECT...
```

**O que significam:**

- `[TOTAL]` = Tempo total no Express (mais lento)
- `TOTAL-*` = Tempo no controller/service
- Números = Tempo de cada operação em ms
- `[QUERY-TIME]` = Queries SQL com tempo

---

## 🔑 Principais Operações a Medir

| Operação             | Tempo Normal | Tempo Alerta | Onde mexer   |
| -------------------- | ------------ | ------------ | ------------ |
| `UPLOAD-IMAGES`      | <2s          | >3s          | ImageService |
| `EXTERNAL-API-CEP`   | 200-500ms    | >1s          | Cache API    |
| `FIND-PROPERTIES`    | <300ms       | >1s          | Índices DB   |
| `TRANSACTION-COMMIT` | <20ms        | >100ms       | Conexão DB   |

---

## 📞 Como Reportar um Problema

Use este template:

```
ENDPOINT: POST /properties
TEMPO TOTAL: 4523ms
GARGALO: 8-UPLOAD-IMAGES (4012ms)

Logs: [Cole aqui os logs do console]

Contexto:
- [ ] Usou 1 imagem
- [ ] Usou 3 imagens
- [ ] Imagens grandes (>2MB)
- [ ] Imagens pequenas (<500KB)

Esperado: <2s
Atual: 4.5s
```

---

## ✨ Bônus: Monitorar em Tempo Real

### Apenas logs de tempo

```bash
npm run dev 2>&1 | grep "ms"
```

### Apenas queries SQL

```bash
npm run dev 2>&1 | grep "QUERY"
```

### Apenas um endpoint

```bash
npm run dev 2>&1 | grep "TOTAL-CREATE"
```

---

## 🎓 O Que Você Aprenderá

✅ Como debugar APIs em Node.js  
✅ Como medir performance  
✅ Onde estão os gargalos  
✅ Como otimizar cada operação  
✅ Como comunicar resultados

---

## 🚀 Vamos Começar!

### Opção 1: Fazer Rápido

→ Leia: **QUICK_START.md**  
→ Tempo: 15 minutos

### Opção 2: Entender Tudo

→ Leia: **README.md**  
→ Tempo: 30 minutos

### Opção 3: Otimizar

→ Leia: **ANALYSIS_GUIDE.md**  
→ Tempo: Depende do problema

---

**Boa sorte! 🎯**
