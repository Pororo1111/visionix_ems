"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrometheusPanelData } from "@/lib/prometheus-api";

interface DashboardPanelProps {
    panel: PrometheusPanelData;
    className?: string;
}

export function DashboardPanel({ panel, className }: DashboardPanelProps) {
    const formatValue = (panel: PrometheusPanelData): string => {
        if (panel.data.length === 0) return "0";

        const result = panel.data[0];

        // query_range 응답 (초기 로드)
        if (result.values && result.values.length > 0) {
            const lastValue = result.values[result.values.length - 1];
            const value = parseFloat(lastValue[1]);
            return isNaN(value) ? "0" : value.toString();
        }

        // query 응답 (실시간 업데이트) - instant query
        if (result.value) {
            // instant query의 경우 [timestamp, value] 형태
            if (Array.isArray(result.value) && result.value.length === 2) {
                const value = parseFloat(result.value[1]);
                return isNaN(value) ? "0" : value.toString();
            } else {
                const value = parseFloat(result.value);
                return isNaN(value) ? "0" : value.toString();
            }
        }

        return "0";
    };

    const getValueColor = (panel: PrometheusPanelData): string => {
        const value = parseFloat(formatValue(panel));

        // 패널 ID에 따른 색상 결정
        switch (panel.id) {
            case "total-devices":
                return "text-blue-600";
            case "normal-devices":
                return "text-green-600";
            case "abnormal-devices":
                return "text-red-600";
            case "normal-rate":
                return value >= 95
                    ? "text-green-600"
                    : value >= 90
                    ? "text-yellow-600"
                    : "text-red-600";
            default:
                return "text-gray-900";
        }
    };

    const getUnit = (panel: PrometheusPanelData): string => {
        switch (panel.id) {
            case "normal-rate":
                return "%";
            default:
                return "";
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {panel.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {panel.id !== "device-health" ? (
                    <div
                        className={`text-2xl font-bold ${getValueColor(panel)}`}
                    >
                        {formatValue(panel)}
                        {getUnit(panel)}
                    </div>
                ) : null}
                <p className="text-xs text-gray-500 mt-1">실시간 업데이트</p>
            </CardContent>
        </Card>
    );
}
