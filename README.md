# 🚀 Visionix EMS

> **Visionix EMS**는 디바이스 관리와 IoT 디바이스 상태 모니터링 기능을 제공하는 웹 애플리케이션입니다.

---

## 🧩 주요 기능

-   📋 디바이스 등록/목록/페이징/검색
-   🟢 디바이스 온라인 상태 실시간 표시
-   🏷️ 설치 위치, IP, 고유 ID 관리

---

## ⚡️ 빠른 시작

### 🖥️ 로컬 개발

```bash
git clone <repository-url>
cd visionix_ems
# .env.local에 DATABASE_URL, PROMETHEUS_URL 등 필수값 입력
pnpm install
pnpm sync         # DB 스키마 동기화
pnpm dev          # 개발 서버 실행
# http://localhost:3000 접속
```

### 🚀 운영 배포 (Docker)

> **운영 환경에서는 반드시 `start-production.sh` 스크립트 사용을 권장합니다!**

```bash
# 1. 환경변수 파일(.env.production) 준비 (NODE_ENV, DATABASE_URL, DB_PASSWORD 등 필수)
# 2. 아래 스크립트로 모든 준비/빌드/실행 자동화
./start-production.sh
# http://localhost 접속
```

---

## 🛠️ 주요 명령어

```bash
pnpm dev      # 개발 서버 실행
pnpm build    # 프로덕션 빌드
pnpm start    # 프로덕션 서버 실행
pnpm sync     # DB 스키마 동기화 (로컬 개발 시)
pnpm migrate  # DB 마이그레이션 (운영 배포 시)
docker-compose up -d   # 개발용 도커 실행
docker-compose -f docker-compose.prod.yml up -d   # 운영용 도커 실행
./start-production.sh   # 운영 환경 시작 (권장)
./stop-production.sh   # 운영 환경 중지
```
