#!/bin/bash

# ============================================
# TESTES DE PERFORMANCE - PROPERTIES API
# ============================================
# Execute este script após ter o servidor rodando
# Faça login primeiro para obter o TOKEN

set -e

# ============================================
# CORES PARA OUTPUT
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# CONFIGURAÇÃO
# ============================================
BASE_URL="http://localhost:3000"
TOKEN="" # Você preenchará isso após fazer login
PROPERTY_ID="" # Será preenchido após criar propriedade

# ============================================
# FUNÇÃO: Print seção
# ============================================
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# ============================================
# FUNÇÃO: Print resultado
# ============================================
print_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Sucesso${NC}\n"
    else
        echo -e "${RED}❌ Falha${NC}\n"
    fi
}

# ============================================
# TESTE 1: LOGIN (obter token)
# ============================================
test_login() {
    print_section "1️⃣ TEST: LOGIN"
    echo -e "${YELLOW}Fazendo login...${NC}\n"

    RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "teste@example.com",
            "password": "senha123"
        }')

    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token' 2>/dev/null)

    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
        echo -e "${RED}❌ Não conseguiu obter token!${NC}"
        echo "Você precisa criar um usuário primeiro."
        echo "Crie via: POST /users com avatar"
        exit 1
    fi

    echo -e "\n${GREEN}✅ Token obtido: ${TOKEN:0:50}...${NC}\n"
}

# ============================================
# TESTE 2: CREATE PROPERTY
# ============================================
test_create_property() {
    print_section "2️⃣ TEST: CREATE PROPERTY"
    echo -e "${YELLOW}Criando propriedade...${NC}\n"

    # Criar um arquivo de imagem dummy (1x1 pixel JPG)
    TEMP_IMG="/tmp/test_property_image.jpg"
    printf '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00\x43\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0C\x14\r\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C ,#\x1C\x1C(7),01444\x1F'\''9=82<.342\xFF\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x11\x00\xFF\xC4\x00\x1F\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xFB\xD0\xFF\xD9' > "$TEMP_IMG"

    RESPONSE=$(curl -s -X POST "$BASE_URL/properties" \
        -H "Authorization: Bearer $TOKEN" \
        -F "title=Apartamento Teste Performance" \
        -F "type=APARTMENT" \
        -F "price=2500" \
        -F "bedroomCount=2" \
        -F "bathroomCount=1" \
        -F "area=85" \
        -F "description=Teste de performance da API" \
        -F "zipCode=01310100" \
        -F "street=Avenida Paulista" \
        -F "number=1000" \
        -F "complement=Apto 500" \
        -F "neighborhood=Bela Vista" \
        -F "files=@$TEMP_IMG" \
        -F "files=@$TEMP_IMG" \
        -F "files=@$TEMP_IMG")

    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

    PROPERTY_ID=$(echo "$RESPONSE" | jq -r '.data.id' 2>/dev/null)

    if [ -z "$PROPERTY_ID" ] || [ "$PROPERTY_ID" == "null" ]; then
        echo -e "${RED}❌ Não conseguiu criar propriedade!${NC}\n"
        return 1
    fi

    echo -e "\n${GREEN}✅ Propriedade criada com ID: $PROPERTY_ID${NC}\n"
}

# ============================================
# TESTE 3: GET ALL PROPERTIES
# ============================================
test_get_all_properties() {
    print_section "3️⃣ TEST: GET ALL PROPERTIES"
    echo -e "${YELLOW}Buscando todas as propriedades...${NC}\n"

    RESPONSE=$(curl -s -X GET "$BASE_URL/properties" \
        -H "Authorization: Bearer $TOKEN")

    echo "Response (primeiras 500 chars):"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -c 500 || echo "$RESPONSE" | head -c 500
    echo "...\n"
}

# ============================================
# TESTE 4: GET PROPERTY BY ID
# ============================================
test_get_property_by_id() {
    print_section "4️⃣ TEST: GET PROPERTY BY ID"

    if [ -z "$PROPERTY_ID" ]; then
        echo -e "${YELLOW}ID da propriedade não disponível${NC}"
        return
    fi

    echo -e "${YELLOW}Buscando propriedade ID: $PROPERTY_ID${NC}\n"

    RESPONSE=$(curl -s -X GET "$BASE_URL/properties/$PROPERTY_ID" \
        -H "Authorization: Bearer $TOKEN")

    echo "Response (primeiras 500 chars):"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -c 500 || echo "$RESPONSE" | head -c 500
    echo "...\n"
}

# ============================================
# TESTE 5: GET MY PROPERTIES
# ============================================
test_get_my_properties() {
    print_section "5️⃣ TEST: GET MY PROPERTIES"
    echo -e "${YELLOW}Buscando minhas propriedades...${NC}\n"

    RESPONSE=$(curl -s -X GET "$BASE_URL/properties/my" \
        -H "Authorization: Bearer $TOKEN")

    echo "Response (primeiras 500 chars):"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -c 500 || echo "$RESPONSE" | head -c 500
    echo "...\n"
}

# ============================================
# TESTE 6: UPDATE PROPERTY
# ============================================
test_update_property() {
    print_section "6️⃣ TEST: UPDATE PROPERTY"

    if [ -z "$PROPERTY_ID" ]; then
        echo -e "${YELLOW}ID da propriedade não disponível${NC}"
        return
    fi

    echo -e "${YELLOW}Atualizando propriedade ID: $PROPERTY_ID${NC}\n"

    RESPONSE=$(curl -s -X PUT "$BASE_URL/properties/$PROPERTY_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Apartamento Teste Updated",
            "price": 2800,
            "bedroomCount": 3,
            "bathroomCount": 2,
            "area": 100,
            "description": "Atualizado via teste",
            "zipCode": "01310100",
            "street": "Avenida Paulista",
            "number": 1000,
            "complement": "Apto 500",
            "neighborhood": "Bela Vista"
        }')

    echo "Response (primeiras 500 chars):"
    echo "$RESPONSE" | jq '.' 2>/dev/null | head -c 500 || echo "$RESPONSE" | head -c 500
    echo "...\n"
}

# ============================================
# TESTE 7: DELETE PROPERTY
# ============================================
test_delete_property() {
    print_section "7️⃣ TEST: DELETE PROPERTY"

    if [ -z "$PROPERTY_ID" ]; then
        echo -e "${YELLOW}ID da propriedade não disponível${NC}"
        return
    fi

    echo -e "${YELLOW}Deletando propriedade ID: $PROPERTY_ID${NC}\n"

    RESPONSE=$(curl -s -X DELETE "$BASE_URL/properties/$PROPERTY_ID" \
        -H "Authorization: Bearer $TOKEN")

    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
}

# ============================================
# MAIN: Executar testes
# ============================================
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║  TESTE DE PERFORMANCE - PROPERTIES API ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}\n"

    echo -e "${YELLOW}⚠️  IMPORTANTE: Certifique-se de que o servidor está rodando!${NC}"
    echo -e "${YELLOW}   Terminal 1: npm run dev${NC}\n"

    # Executar testes em ordem
    test_login
    test_create_property
    test_get_all_properties
    test_get_property_by_id
    test_get_my_properties
    test_update_property
    test_delete_property

    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Todos os testes executados!${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"

    echo -e "${YELLOW}📋 PRÓXIMOS PASSOS:${NC}"
    echo "1. Verifique os logs no terminal do servidor"
    echo "2. Procure por [QUERY-TIME] e console.time markers"
    echo "3. Identifique qual operação é mais lenta"
    echo "4. Compare com os tempos esperados no README.md"
    echo ""
}

# Executar
main "$@"
