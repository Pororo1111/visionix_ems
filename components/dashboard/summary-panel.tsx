"use client";

import { PrometheusPanelData } from "@/lib/prometheus-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryPanelProps {
    data: PrometheusPanelData[];
    lastUpdate?: Date;
}

export function SummaryPanel({ data, lastUpdate }: SummaryPanelProps) {
    // 중요한 메트릭들 추출
    const normalDevices = data.find(d => d.id === "normal-devices");
    const abnormalDevices = data.find(d => d.id === "abnormal-devices");
    const normalRate = data.find(d => d.id === "normal-rate");
    const avgCpu = data.find(d => d.id === "avg-cpu");
    const avgMemory = data.find(d => d.id === "avg-memory");
    const cpuOver85 = data.find(d => d.id === "cpu-over-85");

    const getValue = (panel?: PrometheusPanelData) => {
        if (!panel?.data || panel.data.length === 0) return "0";
        const lastValue = panel.data[panel.data.length - 1];
        if (lastValue && typeof lastValue === "object" && "value" in lastValue) {
            return parseFloat(lastValue.value as string).toFixed(1);
        }
        return "0";
    };


    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                <div className="shrink-0 p-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-2">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                🚀 실시간 대시보드
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Visionix EMS 시스템 모니터링
                            </p>
                        </div>
                        {lastUpdate && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">업데이트: {lastUpdate.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto">
                    <div className="space-y-3">
                        {/* AI 검사 현황 */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                            <CardHeader className="py-2 px-3">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    🤖 AI 검사 현황
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 pt-0">
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                        <div className="text-lg font-bold text-green-600">
                                            {getValue(normalDevices)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            정상 디바이스
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                        <div className="text-lg font-bold text-red-500 dark:text-red-400">
                                            {getValue(abnormalDevices)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            비정상 디바이스
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Badge variant={
                                        parseFloat(getValue(normalRate)) >= 90 ? "default" : "destructive"
                                    } className="text-xs">
                                        정상률: {getValue(normalRate)}%
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>
        </div>
    );
}