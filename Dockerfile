# 멀티 스테이지 빌드
FROM node:18-alpine AS base

# 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml* ./

# pnpm 설치
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 빌드 스테이지
FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경변수 파일 복사 (빌드 시점에 필요)
COPY .env.production ./.env.production

# 환경변수 설정
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 빌드 실행
RUN npm install -g pnpm
RUN pnpm build

# 프로덕션 스테이지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 파일 복사
COPY --from=builder /app/public ./public

# 환경변수 파일 복사 (런타임에서 사용)
COPY --from=builder /app/.env.production ./.env.production

# 자동으로 생성된 standalone 출력 사용
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
