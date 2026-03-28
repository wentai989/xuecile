FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm run build

# 生产环境阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
