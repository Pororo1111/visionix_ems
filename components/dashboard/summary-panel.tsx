"use client";

import { PrometheusPanelData } from "@/lib/prometheus-api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    
    // OCR 관련 데이터 추출
    const ocrTimeData = data.find(d => d.id === "ocr-time");
    const ocrServerTimestampData = data.find(d => d.id === "ocr-server-timestamp");
    
    // OCR 상태 계산 헬퍼 함수들
    const getMatchStatusText = (isMatch: boolean) => {
        return isMatch ? "🟢 일치" : "🔴 불일치";
    };
    
    const getMatchStatusColor = (isMatch: boolean) => {
        return isMatch ? "text-green-600" : "text-red-600";
    };

    const getValue = (panel?: PrometheusPanelData) => {
        if (!panel?.data || panel.data.length === 0) return "0";
        const lastValue = panel.data[panel.data.length - 1];
        
        console.log(`🔍 getValue 디버그 - ${panel.id}:`, {
            panel: panel.id,
            dataLength: panel.data.length,
            lastValue: lastValue,
            hasValue: lastValue && "value" in lastValue
        });
        
        if (lastValue && typeof lastValue === "object" && "value" in lastValue) {
            // Prometheus 응답 구조: value는 [timestamp, "실제값"] 배열
            const prometheusValue = (lastValue as any).value;
            let actualValue: string;
            
            if (Array.isArray(prometheusValue) && prometheusValue.length >= 2) {
                // value[1]이 실제 값
                actualValue = prometheusValue[1];
            } else {
                // 배열이 아닌 경우 그대로 사용
                actualValue = prometheusValue;
            }
            
            console.log(`📊 ${panel.id} 파싱 결과:`, {
                prometheusValue,
                actualValue,
                parsed: parseFloat(actualValue)
            });
            
            const numValue = parseFloat(actualValue);
            
            // 매우 큰 값인 경우 정수로 반올림하여 표시 (디바이스 개수는 정수여야 함)
            if (panel.id === "normal-devices" || panel.id === "abnormal-devices" || panel.id === "total-devices") {
                return Math.round(numValue).toString();
            }
            
            // 백분율의 경우 소수점 1자리까지 표시
            if (panel.id === "normal-rate" || panel.id?.includes("percent") || panel.id?.includes("rate")) {
                return numValue.toFixed(1);
            }
            
            // 기타 값들도 적절히 반올림
            return numValue.toFixed(1);
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

                        {/* OCR 검사 결과 */}
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600">
                            <CardHeader className="py-2 px-3">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    ⏱️ OCR 검사 결과
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 pt-0">
                                {!ocrTimeData?.data || ocrTimeData.data.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        <div className="text-xs">데이터가 없습니다</div>
                                    </div>
                                ) : (
                                    <div className="max-h-32 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="text-xs">
                                                    <TableHead className="text-xs py-1 px-2">IP</TableHead>
                                                    <TableHead className="text-xs py-1 px-2 text-center">OCR</TableHead>
                                                    <TableHead className="text-xs py-1 px-2 text-center">수집</TableHead>
                                                    <TableHead className="text-xs py-1 px-2 text-center">일치</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ocrTimeData.data.map((item, index) => {
                                                    const ocrTimeValue = item.value[1];
                                                    const serverTimestamp = ocrServerTimestampData?.data.find(d => d.metric.instance === item.metric.instance)?.value[1];
                                                    
                                                    const ocrTime = new Date(parseFloat(ocrTimeValue) * 1000);
                                                    const serverTime = serverTimestamp ? new Date(parseFloat(serverTimestamp) * 1000) : null;
                                                    
                                                    const isMatch = serverTime ? 
                                                        ocrTime.getHours() === serverTime.getHours() &&
                                                        ocrTime.getMinutes() === serverTime.getMinutes() &&
                                                        ocrTime.getSeconds() === serverTime.getSeconds()
                                                        : false;

                                                    const deviceIp = item.metric.instance;

                                                    return (
                                                        <TableRow key={index}>
                                                            <TableCell className="text-xs py-1 px-2">{deviceIp.split(':')[0]}</TableCell>
                                                            <TableCell className="text-xs py-1 px-2 text-center">{ocrTime.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}</TableCell>
                                                            <TableCell className="text-xs py-1 px-2 text-center">{serverTime ? serverTime.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}) : 'N/A'}</TableCell>
                                                            <TableCell className={`text-xs py-1 px-2 text-center ${getMatchStatusColor(isMatch)}`}>{getMatchStatusText(isMatch)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-2 text-center">실시간 업데이트</div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}