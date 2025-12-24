FROM node:20-alpine AS build
WORKDIR /app

# install dependencies
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "index.js"]