"use client";

import { useEffect, useState } from "react";
import { DashboardPanel } from "./dashboard-panel";
import { SystemResourcePanel } from "./system-resource-panel";
import { TrendChart } from "./trend-chart";
import { DeviceTable } from "./device-table";
import { PrometheusPanelData } from "@/lib/prometheus-api";
import { OcrPanel } from "./ocr-panel";
import { OcrMismatchTablePanel } from "./ocr-mismatch-table-panel";

interface DashboardClientProps {
    initialData: PrometheusPanelData[];
    initialTime: string;
}

export function DashboardClient({
    initialData,
    initialTime,
}: DashboardClientProps) {
    const [data, setData] = useState<PrometheusPanelData[]>(initialData);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date(initialTime));
    const [countdown, setCountdown] = useState<number>(5);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const now = new Date();
                const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

                // 한 번의 API 호출로 모든 패널 데이터 가져오기
                const response = await fetch("/api/dashboard/all-panels", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        start: oneHourAgo.toISOString(),
                        end: now.toISOString(),
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("All panels data:", result.data);

                    if (result.data && Array.isArray(result.data)) {
                        setData(result.data);
                        setLastUpdate(new Date());
                        setCountdown(5); // 카운트다운 리셋
                    } else {
                        console.warn("Invalid data format received");
                    }
                } else {
                    console.error("API error:", response.status);
                }
            } catch (error) {
                console.error("Error updating dashboard data:", error);
            }
        }, 5000); // 5초마다 업데이트

        return () => clearInterval(interval);
    }, [data]);

    // 카운트다운 타이머
    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 5; // 5초로 리셋
                }
                return prev - 1;
            });
        }, 1000); // 1초마다 카운트다운

        return () => clearInterval(countdownInterval);
    }, []);

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        실시간 대시보드
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Visionix EMS 시스템 모니터링
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">마지막 업데이트</p>
                    <p className="text-sm font-medium">
                        {lastUpdate.toLocaleTimeString("ko-KR")}
                    </p>
                </div>
            </div>

            {/* 기본 통계 패널들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data
                    .filter((panel) =>
                        [
                            "total-devices",
                            "normal-devices",
                            "abnormal-devices",
                            "normal-rate",
                        ].includes(panel.id)
                    )
                    .map((panel) => (
                        <DashboardPanel key={panel.id} panel={panel} />
                    ))}
            </div>

            {/* 시스템 리소스 패널들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data
                    .filter((panel) =>
                        [
                            "avg-cpu",
                            "avg-memory",
                            "avg-disk",
                            "cpu-over-85",
                        ].includes(panel.id)
                    )
                    .map((panel) => (
                        <SystemResourcePanel key={panel.id} panel={panel} />
                    ))}
            </div>

            {/* 트렌드 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data
                    .filter((panel) =>
                        ["normal-rate-trend", "cpu-trend"].includes(panel.id)
                    )
                    .map((panel) => (
                        <TrendChart key={panel.id} panel={panel} />
                    ))}
            </div>

            {/* 디바이스 테이블들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data
                    .filter((panel) =>
                        ["cpu-top-20", "memory-top-20"].includes(panel.id)
                    )
                    .map((panel) => (
                        <DeviceTable key={panel.id} panel={panel} />
                    ))}
            </div>

            {/* AI 검사 실패 및 헬스체크 테이블 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data
                    .filter((panel) =>
                        ["ai-failed-devices", "device-health"].includes(
                            panel.id
                        )
                    )
                    .map((panel) => (
                        <DeviceTable key={panel.id} panel={panel} />
                    ))}
            </div>

            {/* OCR 패널들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(() => {
                    const ocrTimePanel = data.find(p => p.id === "ocr-time");
                    const ocrServerTimestampPanel = data.find(p => p.id === "ocr-server-timestamp");
                    return ocrTimePanel ? (
                        <OcrPanel
                            key={ocrTimePanel.id}
                            initialOcrTimePanel={ocrTimePanel}
                            initialOcrServerTimestampPanel={ocrServerTimestampPanel}
                        />
                    ) : null;
                })()}
                {(() => {
                    const ocrMismatchListPanel = data.find(p => p.id === "ocr-mismatch-list");
                    const ocrServerTimestampPanel = data.find(p => p.id === "ocr-server-timestamp");
                    return ocrMismatchListPanel ? (
                        <OcrMismatchTablePanel
                            key={ocrMismatchListPanel.id}
                            initialOcrMismatchListPanel={ocrMismatchListPanel}
                            initialOcrServerTimestampPanel={ocrServerTimestampPanel}
                        />
                    ) : null;
                })()}
            </div>

            {/* 상태 표시 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-sm text-green-700">
                            실시간 데이터 수집 중...
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            다음 업데이트:
                        </span>
                        <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                            {countdown}초
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
