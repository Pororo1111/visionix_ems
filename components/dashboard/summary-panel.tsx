"use client";

import { PrometheusPanelData } from "@/lib/prometheus-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryPanelProps {
    data: PrometheusPanelData[];
    lastUpdate?: Date;
}

export function SummaryPanel({ data, lastUpdate }: SummaryPanelProps) {
    // 중요한 메트릭들 추출
    const totalDevices = data.find(d => d.id === "total-devices");
    const normalDevices = data.find(d => d.id === "normal-devices");
    const abnormalDevices = data.find(d => d.id === "abnormal-devices");
    const normalRate = data.find(d => d.id === "normal-rate");
    const deviceHealth = data.find(d => d.id === "device-health");
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

    const getHealthyDevices = () => {
        if (!deviceHealth?.data) return 0;
        return deviceHealth.data.filter((item: any) => 
            item.value && parseFloat(item.value) > 0
        ).length;
    };

    return (
        <div className="space-y-4 h-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                🚀 실시간 대시보드
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Visionix EMS 시스템 모니터링
                            </p>
                        </div>
                        {lastUpdate && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 dark:text-gray-400">마지막 업데이트</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {lastUpdate.toLocaleTimeString("ko-KR")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 space-y-4">
                    {/* AI 검사 현황 */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
                                🤖 AI 검사 현황
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {getValue(normalDevices)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        정상 디바이스
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-500 dark:text-red-400">
                                        {getValue(abnormalDevices)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        비정상 디바이스
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <Badge variant={
                                    parseFloat(getValue(normalRate)) >= 90 ? "default" : "destructive"
                                }>
                                    정상률: {getValue(normalRate)}%
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* 헬스체크 현황 */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
                                💓 헬스체크 현황
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    온라인 디바이스
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-bold text-green-600">
                                        {getHealthyDevices()} / {getValue(totalDevices)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* 시스템 리소스 요약 */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-700 dark:text-gray-300">
                                ⚡ 시스템 리소스
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">평균 CPU</span>
                                <Badge variant={
                                    parseFloat(getValue(avgCpu)) > 80 ? "destructive" : "default"
                                }>
                                    {getValue(avgCpu)}%
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">평균 메모리</span>
                                <Badge variant={
                                    parseFloat(getValue(avgMemory)) > 80 ? "destructive" : "default"
                                }>
                                    {getValue(avgMemory)}%
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">고부하 디바이스</span>
                                <Badge variant={
                                    parseFloat(getValue(cpuOver85)) > 0 ? "destructive" : "default"
                                }>
                                    {getValue(cpuOver85)}개
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}