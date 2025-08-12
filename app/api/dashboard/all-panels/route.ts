import { NextRequest, NextResponse } from "next/server";
import { PrometheusAPI } from "@/lib/prometheus-api";

const prometheusAPI = new PrometheusAPI();

export async function POST(request: NextRequest) {
    try {
        let { start, end } = await request.json();

        if (!start || !end) {
            // 기본값으로 1시간 전부터 현재까지 설정
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
            start = oneHourAgo.toISOString();
            end = now.toISOString();
        }

        // 모든 패널 쿼리 정의
        const queries = [
            // 기본 통계 패널들
            {
                id: "total-devices",
                expr: "count(app_status)",
                title: "전체 디바이스 수",
            },
            {
                id: "normal-devices",
                expr: "count(app_status == 1)",
                title: "AI 검사 정상 디바이스 수",
            },
            {
                id: "abnormal-devices",
                expr: "count(app_status == 0)",
                title: "AI 검사 비정상 디바이스 수",
            },
            {
                id: "normal-rate",
                expr: "(count(app_status == 1) / count(app_status)) * 100",
                title: "정상률",
            },

            // 시스템 리소스 패널들
            {
                id: "avg-cpu",
                expr: "avg(system_cpu_percent)",
                title: "평균 CPU 사용률",
            },
            {
                id: "avg-memory",
                expr: "avg(system_memory_percent)",
                title: "평균 메모리 사용률",
            },
            {
                id: "avg-disk",
                expr: "avg(system_disk_usage_percent)",
                title: "평균 디스크 사용률",
            },
            {
                id: "cpu-over-85",
                expr: "count(system_cpu_percent > 85)",
                title: "CPU 85% 초과 디바이스 수",
            },

            // 트렌드 차트
            {
                id: "normal-rate-trend",
                expr: "(count(app_status == 1) / count(app_status)) * 100",
                title: "AI 검사 정상 비율 트렌드",
            },
            {
                id: "cpu-trend",
                expr: "system_cpu_percent",
                title: "평균 CPU 사용률 트렌드",
            },

            // 디바이스 테이블들
            {
                id: "cpu-top-20",
                expr: "topk(20, system_cpu_percent)",
                title: "CPU 사용률 상위 20개 디바이스",
            },
            {
                id: "memory-top-20",
                expr: "topk(20, system_memory_percent)",
                title: "메모리 사용률 상위 20개 디바이스",
            },
            {
                id: "ai-failed-devices",
                expr: "app_status == 0",
                title: "AI 검사 실패 디바이스 목록",
            },
            {
                id: "device-health",
                expr: 'up{job="devices"}',
                title: "전체 디바이스 헬스체크 상태",
            },
            {
                id: "ocr-time",
                expr: "ocr_time_value",
                title: "OCR 시간",
            },
            {
                id: "ocr-server-timestamp",
                expr: "ocr_timestamp_seconds",
                title: "OCR 서버 타임스탬프",
            },
            {
                id: "ocr-mismatch-list",
                expr: "ocr_time_value != ocr_timestamp_seconds",
                title: "OCR 시간 불일치 목록",
            },
        ];

        // 모든 쿼리를 병렬로 실행
        const results = await prometheusAPI.getMultiplePanelData(
            queries,
            start,
            end
        );

        // 디버깅: AI검사 및 OCR 관련 패널 로깅
        const debugPanels = results.filter(r => 
            r.id === 'normal-devices' || r.id === 'abnormal-devices' || r.id === 'normal-rate' ||
            r.id === 'ocr-time' || r.id === 'ocr-server-timestamp'
        );
        console.log('🔍 AI검사 현황 및 OCR 패널 디버그:', JSON.stringify(debugPanels, null, 2));

        return NextResponse.json({ data: results });
    } catch (error) {
        console.error("Error fetching all panels data:", error);
        return NextResponse.json(
            { error: "Failed to fetch all panels data" },
            { status: 500 }
        );
    }
}
