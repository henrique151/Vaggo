FROM node:20-alpine

WORKDIR /usr/src/app

# Copia os arquivos de configuração do Node
COPY package*.json ./
COPY tsconfig.json ./

# Instala todas as dependências (incluindo as de desenvolvimento para o build)
RUN npm install

# Copia todo o código fonte
COPY . .

# Roda o build (gera a pasta dist)
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para rodar
CMD ["node", "dist/server.js"]