FROM node:20-bullseye-slim
WORKDIR /app

# install dependencies and OpenSSL for Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "index.js"]
