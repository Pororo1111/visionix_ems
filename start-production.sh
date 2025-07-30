#!/bin/bash

# ===========================================
# Visionix EMS 프로덕션 환경 실행 스크립트
# ===========================================

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 Visionix EMS 프로덕션 환경을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. 환경 확인
print_step "환경 확인 중..."

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    print_error "Docker가 설치되지 않았습니다. Docker를 먼저 설치해주세요."
    exit 1
fi

# Docker Compose 설치 확인
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose가 설치되지 않았습니다. Docker Compose를 먼저 설치해주세요."
    exit 1
fi

print_success "Docker 및 Docker Compose 설치 확인 완료"

# 2. 환경변수 파일 확인 및 생성
print_step "환경변수 파일 확인 중..."

if [ ! -f ".env.production" ]; then
    print_warning ".env.production 파일이 없습니다. 생성 중..."
    cat > .env.production << 'EOF'
# ===========================================
# Visionix EMS 프로덕션 환경변수
# ===========================================

NODE_ENV=production
DB_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:your_secure_password_here@db:5432/visionix_ems
PROMETHEUS_URL=http://prometheus:9090

# 기타 설정
NEXT_TELEMETRY_DISABLED=1
EOF
    print_warning "⚠️  .env.production 파일을 생성했습니다. 보안을 위해 DB_PASSWORD를 변경해주세요!"
fi



print_success "환경변수 파일 확인 완료"

# 3. 기존 컨테이너 정리 (선택사항)
print_step "기존 컨테이너 확인 중..."

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "기존에 실행 중인 컨테이너가 있습니다."
    read -p "기존 컨테이너를 중지하고 새로 시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "기존 컨테이너 중지 중..."
        docker-compose -f docker-compose.prod.yml down
        print_success "기존 컨테이너 중지 완료"
    fi
fi

# 4. 이미지 빌드
print_step "Docker 이미지 빌드 중..."
docker-compose -f docker-compose.prod.yml build
print_success "Docker 이미지 빌드 완료"

# 5. 컨테이너 시작
print_step "프로덕션 컨테이너 시작 중..."
docker-compose -f docker-compose.prod.yml up -d
print_success "프로덕션 컨테이너 시작 완료"

# 6. 컨테이너 상태 확인
print_step "컨테이너 상태 확인 중..."
sleep 5  # 컨테이너 시작 대기

echo ""
echo "📊 컨테이너 상태:"
docker-compose -f docker-compose.prod.yml ps

# 7. 접속 정보 출력
echo ""
echo "🎉 Visionix EMS 프로덕션 환경이 성공적으로 시작되었습니다!"
echo ""
echo "📋 접속 정보:"
echo "  🌐 웹 애플리케이션: http://localhost"
echo "  📈 Prometheus:     http://localhost:9090"
echo ""
echo "📝 유용한 명령어:"
echo "  # 로그 확인"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  # 서비스 중지"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "  # 컨테이너 상태 확인"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""

# 8. 로그 확인 옵션
read -p "실시간 로그를 확인하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "실시간 로그 출력 중... (Ctrl+C로 종료)"
    docker-compose -f docker-compose.prod.yml logs -f
fi

print_success "스크립트 실행 완료!" 