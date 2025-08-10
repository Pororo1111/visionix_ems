"use client";

import { useEffect, useState } from "react";
import { DashboardPanel } from "./dashboard-panel";
import { SystemResourcePanel } from "./system-resource-panel";
import { TrendChart } from "./trend-chart";
import { DeviceTable } from "./device-table";
import { PrometheusPanelData } from "@/lib/prometheus-api";
import { OcrPanel } from "./ocr-panel";
import { OcrMismatchTablePanel } from "./ocr-mismatch-table-panel";
import { ThreeDView } from "./3d-view";
import { SummaryPanel } from "./summary-panel";

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
                        setCountdown(5);
                    } else {
                        console.warn("Invalid data format received");
                    }
                } else {
                    console.error("API error:", response.status);
                }
            } catch (error) {
                console.error("Error updating dashboard data:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [data]);

    useEffect(() => {
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, []);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* 왼쪽: 3D 뷰 */}
            <div className="flex-1 lg:flex-[2]">
                <ThreeDView />
            </div>

            {/* 오른쪽: 요약 패널 */}
            <div className="lg:w-80 xl:w-96">
                <div className="sticky top-6">
                    <SummaryPanel data={data} lastUpdate={lastUpdate} />

                    {/* 상태 표시 */}
                    <div className="mt-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-center lg:justify-between space-x-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs lg:text-sm text-green-700 dark:text-green-400">
                                    실시간 모니터링
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    업데이트:
                                </span>
                                <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-1 py-0.5 rounded">
                                    {countdown}초
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}