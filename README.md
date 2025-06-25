# 🚀 Visionix EMS

> **Visionix EMS**는 디바이스 관리와 IoT 디바이스 상태 모니터링 기능을 제공하는 웹 애플리케이션입니다.

---

## 🧩 주요 기능
- 📋 디바이스 등록/목록/페이징/검색
- 🟢 디바이스 온라인 상태 실시간 표시
- 🏷️ 설치 위치, IP, 고유 ID 관리
- 🔄 주기적 헬스체크(온라인/오프라인 자동 반영)
- 💻 반응형 UI & 모바일 최적화
- 🎨 shadcn/ui 기반 세련된 디자인
- ✨ 부드러운 애니메이션 (framer-motion)
- 📊 Grafana 대시보드 연동
- 📡 Prometheus 메트릭 수집

---

## 🛠️ 기술 스택
- **Next.js 15** (App Router, SSR/CSR)
- **TypeScript** (strict mode)
- **shadcn/ui** + **Tailwind CSS** (UI/스타일)
- **Drizzle ORM** (DB/모델)
- **PostgreSQL** (DB)
- **framer-motion** (애니메이션)
- **React 19**
- **Docker** (컨테이너화)
- **Grafana** (모니터링)
- **Prometheus** (메트릭 수집)

---

## 📁 폴더 구조
```
visionix_ems/
├── app/                # Next.js App Router
├── components/         # UI/도메인 컴포넌트 (shadcn/ui)
├── domain/             # 도메인(디바이스 등) 모델/서비스/레포지토리
├── lib/                # DB, 유틸리티
├── db/                 # 마이그레이션
├── hooks/              # 커스텀 훅
├── public/             # 정적 파일
├── grafana/            # Grafana 설정
├── nginx/              # Nginx 설정
├── Dockerfile          # 도커 빌드 설정
├── docker-compose.yml  # 개발용 도커 컴포즈
├── docker-compose.prod.yml # 프로덕션용 도커 컴포즈
└── ...
```

---

## ⚡️ 빠른 시작

### 🐳 Docker를 사용한 실행 (권장)

#### 개발 환경
```bash
# 1. 저장소 클론
git clone <repository-url>
cd visionix_ems

# 2. 환경변수 파일 생성
touch .env

# 3. 개발용 도커 컴포즈 실행
docker-compose up -d

# 4. 브라우저에서 접속
# - 웹 애플리케이션: http://localhost:3000
# - Grafana: http://localhost:4000
# - Prometheus: http://localhost:9090
```

#### 프로덕션 환경
```bash
# 1. 환경변수 파일 생성
touch .env.production
touch .env.grafana

# 2. 환경변수 설정 (필수)
# .env.production 파일 편집
NODE_ENV=production
DB_PASSWORD=your_secure_password

# .env.grafana 파일 편집
GRAFANA_PASSWORD=your_grafana_password
GRAFANA_DOMAIN=your-domain.com  # 도메인이 있는 경우
GRAFANA_ROOT_URL=https://your-domain.com/grafana  # 도메인이 있는 경우
# 또는
GRAFANA_DOMAIN=localhost
GRAFANA_ROOT_URL=http://localhost/grafana

# 3. 프로덕션 도커 컴포즈 실행
docker-compose -f docker-compose.prod.yml up -d

# 4. 브라우저에서 접속
# - 웹 애플리케이션: http://localhost:3000
# - Grafana: http://localhost:4000
# - Prometheus: http://localhost:9090
```

### 🔧 로컬 개발 환경

#### 필수 요구사항
- Node.js 18+
- pnpm
- PostgreSQL

#### 설치 및 실행
```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 파일 생성
touch .env

# 3. 환경변수 설정
# .env 파일 편집
DATABASE_URL=postgresql://postgres:password@localhost:5432/visionix_ems

# 4. 데이터베이스 마이그레이션
pnpm sync

# 5. 개발 서버 실행
pnpm dev

# 6. 브라우저에서 접속
# http://localhost:3000
```
---

## 🐳 Docker 명령어

### 개발 환경
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f
```

### 프로덕션 환경
```bash
# 이미지 재빌드
docker-compose -f docker-compose.prod.yml build 

# 서비스 시작
docker-compose -f docker-compose.prod.yml up -d

# 서비스 중지
docker-compose -f docker-compose.prod.yml down
```

---

## 📊 모니터링 접속

### 개발 환경
- **웹 애플리케이션**: http://localhost:3000
- **Grafana**: http://localhost:4000 (admin/admin)
- **Prometheus**: http://localhost:9090

### 프로덕션 환경
- **웹 애플리케이션**: http://localhost:3000
- **Grafana**: http://localhost:4000 (설정한 비밀번호)
- **Prometheus**: http://localhost:9090

---
## 🛠️ 개발 도구

### 스크립트 명령어
```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # 코드 린팅
pnpm sync         # DB 스키마 동기화
pnpm generate     # 마이그레이션 파일 생성
pnpm migrate      # 마이그레이션 실행
```


---

## 📝 커밋 컨벤션
- `feat:` 기능 추가
- `fix:` 버그 수정
- `refactor:` 리팩터링
- `style:` 스타일/포맷팅
- `docs:` 문서/주석
- `chore:` 기타 작업

---


## 🗒️ TODO (예정 기능)
- [x] 📊 **그라파나(Grafana) 연동**: 실시간 모니터링/시각화 대시보드
- [x] 📡 **Prometheus 메트릭 수집**: 시스템 모니터링
- [x] 📡 **디바이스 상태값(센서 등) 수집/표시**: 온도, 습도, 배터리 등
- [ ] 🛠️ **관리자 기능**: 디바이스 수정/삭제, 권한 관리 등
