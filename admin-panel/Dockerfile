FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npx next build

EXPOSE 3001

CMD ["sh", "scripts/start.sh"]
