# Multi-stage build для Next.js приложения

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости из предыдущего stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отключаем telemetry Next.js для ускорения сборки
ENV NEXT_TELEMETRY_DISABLED 1

# Принимаем build arguments для переменных окружения
# Эти переменные нужны во время сборки для встраивания в клиентский код
ARG NEXT_PUBLIC_API_TOKEN
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_DZI_API_BASE_URL

# Устанавливаем переменные окружения для сборки
# NEXT_PUBLIC_* переменные встраиваются в клиентский код во время сборки
ENV NEXT_PUBLIC_API_TOKEN=$NEXT_PUBLIC_API_TOKEN
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_DZI_API_BASE_URL=$NEXT_PUBLIC_DZI_API_BASE_URL

# Собираем приложение
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Создаем директорию для загрузок
RUN mkdir -p /app/uploads/chunks /app/uploads/final && \
    chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

# Увеличиваем лимит памяти для больших файлов
ENV NODE_OPTIONS="--max-old-space-size=4096"

CMD ["node", "server.js"]
