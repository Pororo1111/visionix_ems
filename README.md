# 🚀 Visionix EMS

> **Visionix EMS**는 디바이스 관리와 헬스체크 기능을 제공하는 현대적인 풀스택 웹 애플리케이션입니다.

---

## 🧩 주요 기능
- 📋 디바이스 등록/목록/페이징/검색
- 🟢 디바이스 온라인 상태 실시간 표시
- 🏷️ 설치 위치, IP, 고유 ID 관리
- 🔄 주기적 헬스체크(온라인/오프라인 자동 반영)
- 💻 반응형 UI & 모바일 최적화
- 🎨 shadcn/ui 기반 세련된 디자인
- ✨ 부드러운 애니메이션 (framer-motion)

---

## 🛠️ 기술 스택
- **Next.js 15** (App Router, SSR/CSR)
- **TypeScript** (strict mode)
- **shadcn/ui** + **Tailwind CSS** (UI/스타일)
- **Drizzle ORM** (DB/모델)
- **PostgreSQL** (DB)
- **framer-motion** (애니메이션)
- **React 19**

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
├── ...
```

---

## ⚡️ 빠른 시작
```bash
# 1. 의존성 설치
pnpm install

# 2. 개발 서버 실행
pnpm dev

# 3. (최초 1회) DB 마이그레이션
pnpm sync
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
- [ ] 📊 **그라파나(Grafana) 연동**: 실시간 모니터링/시각화 대시보드
- [ ] 📡 **디바이스 상태값(센서 등) 수집/표시**: 온도, 습도, 배터리 등
- [ ] 🛠️ **관리자 기능**: 디바이스 수정/삭제, 권한 관리 등
