FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件（容错处理：如果没有 pnpm-lock.yaml 也能安装）
COPY package.json ./
COPY pnpm-lock.yaml* ./

# 安装依赖
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build

# 生产环境阶段
FROM node:18-alpine AS runner

# 安装 pnpm 用于执行 drizzle-kit
RUN npm install -g pnpm

WORKDIR /app

# 复制构建产物和配置文件
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/server/db/schema.ts ./server/db/schema.ts

# 安装生产环境依赖 (主要为了 drizzle-kit)
RUN pnpm install drizzle-kit drizzle-orm mysql2 dotenv

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
