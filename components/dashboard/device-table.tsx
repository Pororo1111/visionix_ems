"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PrometheusPanelData } from "@/lib/prometheus-api";

interface DeviceTableProps {
    panel: PrometheusPanelData;
    className?: string;
}

export function DeviceTable({ panel, className }: DeviceTableProps) {
    const getTableData = (panel: PrometheusPanelData) => {
        if (panel.data.length === 0) return [];

        return panel.data.map((result: any) => {
            const instance = result.metric?.instance || "Unknown";

            // value 처리 개선
            let value = 0;
            if (result.value) {
                // instant query의 경우 [timestamp, value] 형태
                if (Array.isArray(result.value) && result.value.length === 2) {
                    value = parseFloat(result.value[1]);
                } else {
                    value = parseFloat(result.value);
                }
            }

            return {
                instance,
                value,
                status: getStatusText(panel.id, value),
            };
        });
    };

    const getStatusText = (panelId: string, value: number): string => {
        switch (panelId) {
            case "cpu-top-20":
                if (value >= 85) return "🔴 위험";
                if (value >= 70) return "🟡 주의";
                return "🟢 정상";
            case "memory-top-20":
                if (value >= 85) return "🔴 위험";
                if (value >= 70) return "🟡 주의";
                return "🟢 정상";
            case "ai-failed-devices":
                return value === 0 ? "🔴 실패" : "🟢 정상";
            case "device-health":
                return value === 1 ? "🟢 온라인" : "🔴 오프라인";
            default:
                return "❓ 알 수 없음";
        }
    };

    const getStatusColor = (status: string): string => {
        if (status.includes("🔴")) return "text-red-600";
        if (status.includes("🟡")) return "text-yellow-600";
        if (status.includes("🟢")) return "text-green-600";
        return "text-gray-600";
    };

    const getIcon = (panel: PrometheusPanelData): string => {
        switch (panel.id) {
            case "cpu-top-20":
                return "🖥️";
            case "memory-top-20":
                return "💾";
            case "ai-failed-devices":
                return "❌";
            case "device-health":
                return "🖥️";
            default:
                return "📊";
        }
    };

    const getUnit = (panel: PrometheusPanelData): string => {
        switch (panel.id) {
            case "cpu-top-20":
            case "memory-top-20":
                return "%";
            default:
                return "";
        }
    };

    const tableData = getTableData(panel);

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    <span className="mr-2">{getIcon(panel)}</span>
                    {panel.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {tableData.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">
                                        디바이스 IP
                                    </TableHead>
                                    <TableHead className="text-xs text-center">
                                        상태
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.slice(0, 10).map((device, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="text-xs font-medium">
                                            {device.instance}
                                        </TableCell>
                                        <TableCell
                                            className={`text-xs text-center font-medium ${getStatusColor(
                                                device.status
                                            )}`}
                                        >
                                            {device.status}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-sm">데이터가 없습니다</div>
                    </div>
                )}

                <p className="text-xs text-gray-500 mt-2">실시간 업데이트</p>
            </CardContent>
        </Card>
    );
}
