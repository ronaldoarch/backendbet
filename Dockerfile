FROM node:22-alpine

WORKDIR /app

# Copiar package.json e package-lock.json primeiro
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production

# Copiar resto do código
COPY . .

# Expor porta (padrão do Node.js)
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production

# Comando de start
CMD ["npm", "start"]
