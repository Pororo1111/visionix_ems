'use client';

import { PrometheusPanelData } from '@/lib/prometheus-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OcrMismatchTablePanelProps {
  initialOcrMismatchListPanel?: PrometheusPanelData;
  initialOcrServerTimestampPanel?: PrometheusPanelData;
}

export function OcrMismatchTablePanel({
  initialOcrMismatchListPanel,
  initialOcrServerTimestampPanel,
}: OcrMismatchTablePanelProps) {
  const [ocrTimePanel, setOcrTimePanel] = useState<PrometheusPanelData | null>(initialOcrMismatchListPanel || null);
  const [ocrServerTimestampPanel, setOcrServerTimestampPanel] = useState<PrometheusPanelData | null>(initialOcrServerTimestampPanel || null);
  const [_error, _setError] = useState<string | null>(null);

  useEffect(() => {
    // Update state when initial props change (from dashboard-client's update cycle)
    setOcrTimePanel(initialOcrMismatchListPanel || null);
    setOcrServerTimestampPanel(initialOcrServerTimestampPanel || null);
  }, [initialOcrMismatchListPanel, initialOcrServerTimestampPanel]);

  if (_error) return <Card><CardContent>Error: {_error}</CardContent></Card>;

  // 디바이스 IP를 키로 사용하여 ocrServerTimestampPanel 데이터를 Map으로 변환
  const serverTimestampMap = new Map<string, string>();
  if (ocrServerTimestampPanel && ocrServerTimestampPanel.data) {
    ocrServerTimestampPanel.data.forEach(d => {
      if (d.metric && d.metric.instance) {
        serverTimestampMap.set(d.metric.instance, d.value[1]);
      }
    });
  }

  // 불일치하는 항목만 필터링
  const mismatchedData = ocrTimePanel?.data.filter(item => {
    const ocrTimeValue = item.value[1];
    const serverTimestamp = serverTimestampMap.get(item.metric.instance);

    const ocrTime = new Date(parseFloat(ocrTimeValue) * 1000);
    const serverTime = serverTimestamp ? new Date(parseFloat(serverTimestamp) * 1000) : null;

    // 시, 분, 초만 비교
    const isMatch = serverTime ? 
      ocrTime.getHours() === serverTime.getHours() &&
      ocrTime.getMinutes() === serverTime.getMinutes() &&
      ocrTime.getSeconds() === serverTime.getSeconds()
      : false;

    return !isMatch; // 불일치하는 항목만 반환
  }) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          <span className="mr-2">⚠️</span>
          OCR 시간 불일치 패널
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mismatchedData.length > 0 ? (
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Device IP</TableHead>
                  <TableHead className="text-xs text-center">OCR 시간</TableHead>
                  <TableHead className="text-xs text-center">수집 시간</TableHead>
                  <TableHead className="text-xs text-center">일치 여부</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mismatchedData.map((item, index) => {
                  const ocrTimeValue = item.value[1];
                  const serverTimestamp = serverTimestampMap.get(item.metric.instance);
                  
                  const ocrTime = new Date(parseFloat(ocrTimeValue) * 1000);
                  const serverTime = serverTimestamp ? new Date(parseFloat(serverTimestamp) * 1000) : null;
                  
                  const deviceIp = item.metric.instance;

                  return (
                    <TableRow key={index} className="bg-red-100">
                      <TableCell className="text-xs font-medium">{deviceIp}</TableCell>
                      <TableCell className="text-xs font-medium text-center">{ocrTime.toLocaleTimeString()}</TableCell>
                      <TableCell className="text-xs font-medium text-center">{serverTime ? serverTime.toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell className="text-xs font-medium text-center">불일치</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-sm">모든 OCR 시간이 수집 시간과 일치합니다.</div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">실시간 업데이트</p>
      </CardContent>
    </Card>
  );
}
