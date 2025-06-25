#!/bin/bash

# ===========================================
# Visionix EMS 프로덕션 환경 중지 스크립트
# ===========================================

set -e  # 에러 발생 시 스크립트 중단

echo "🛑 Visionix EMS 프로덕션 환경을 중지합니다..."

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

# 1. 현재 실행 중인 컨테이너 확인
print_step "현재 실행 중인 컨테이너 확인 중..."

if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_warning "실행 중인 프로덕션 컨테이너가 없습니다."
    exit 0
fi

echo ""
echo "📊 현재 실행 중인 컨테이너:"
docker-compose -f docker-compose.prod.yml ps
echo ""

# 2. 중지 방법 선택
echo "중지 방법을 선택하세요:"
echo "1) 일반 중지 (컨테이너만 중지, 볼륨 유지)"
echo "2) 완전 중지 (컨테이너 + 볼륨 삭제, 데이터 손실 주의!)"
echo "3) 취소"
echo ""

read -p "선택하세요 (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        print_step "컨테이너 중지 중..."
        docker-compose -f docker-compose.prod.yml down
        print_success "컨테이너가 성공적으로 중지되었습니다."
        print_warning "볼륨은 유지되어 데이터가 보존됩니다."
        ;;
    2)
        print_warning "⚠️  주의: 이 작업은 모든 데이터를 삭제합니다!"
        read -p "정말로 모든 데이터를 삭제하시겠습니까? (yes/N): " -r
        echo ""
        if [[ $REPLY == "yes" ]]; then
            print_step "컨테이너 및 볼륨 삭제 중..."
            docker-compose -f docker-compose.prod.yml down -v
            print_success "컨테이너와 볼륨이 성공적으로 삭제되었습니다."
            print_error "모든 데이터가 삭제되었습니다."
        else
            print_warning "작업이 취소되었습니다."
            exit 0
        fi
        ;;
    3)
        print_warning "작업이 취소되었습니다."
        exit 0
        ;;
    *)
        print_error "잘못된 선택입니다."
        exit 1
        ;;
esac

# 3. 정리 옵션
echo ""
read -p "사용하지 않는 Docker 이미지도 정리하시겠습니까? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "사용하지 않는 Docker 이미지 정리 중..."
    docker image prune -f
    print_success "사용하지 않는 Docker 이미지가 정리되었습니다."
fi

echo ""
echo "📝 유용한 명령어:"
echo "  # 다시 시작"
echo "  ./start-production.sh"
echo ""
echo "  # 컨테이너 상태 확인"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "  # 로그 확인"
echo "  docker-compose -f docker-compose.prod.yml logs"
echo ""

print_success "스크립트 실행 완료!" 