FROM node:20-alpine

WORKDIR /app

# Dependencies eerst, zodat Docker deze laag kan cachen
COPY package*.json ./
RUN npm install --omit=dev

# Applicatiecode
COPY src ./src

# Draai niet als root
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
