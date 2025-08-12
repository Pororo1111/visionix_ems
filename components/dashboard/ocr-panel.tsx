'use client';

import { PrometheusPanelData } from '@/lib/prometheus-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OcrPanelProps {
  initialOcrTimePanel?: PrometheusPanelData;
  initialOcrServerTimestampPanel?: PrometheusPanelData;
}

export function OcrPanel({
  initialOcrTimePanel,
  initialOcrServerTimestampPanel,
}: OcrPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
  const [ocrTimePanel, setOcrTimePanel] = useState<PrometheusPanelData | null>(initialOcrTimePanel || null);
  const [ocrServerTimestampPanel, setOcrServerTimestampPanel] = useState<PrometheusPanelData | null>(initialOcrServerTimestampPanel || null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      let finalSearchTerm = value;
      if (value && !value.includes(':')) {
        finalSearchTerm = `${value}:9100`; 
      }
      setSearchTerm(finalSearchTerm);
    }, 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayedSearchTerm(e.target.value);
    debouncedSetSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!searchTerm) {
      setOcrTimePanel(initialOcrTimePanel || null);
      setOcrServerTimestampPanel(initialOcrServerTimestampPanel || null);
    }
  }, [initialOcrTimePanel, initialOcrServerTimestampPanel, searchTerm]);

  useEffect(() => {
    const fetchOcrData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/dashboard/ocr-data?ip=${searchTerm}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setOcrTimePanel(result.ocrTimePanel);
        setOcrServerTimestampPanel(result.ocrServerTimestampPanel);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchOcrData();
    }
  }, [searchTerm]); 

  const renderLoadingSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[280px]" />
      <Skeleton className="h-4 w-[220px]" />
      <Skeleton className="h-4 w-[250px]" />
    </div>
  );

  const getMatchStatusText = (isMatch: boolean) => {
    return isMatch ? "🟢 일치" : "🔴 불일치";
  };

  const getMatchStatusColor = (isMatch: boolean) => {
    return isMatch ? "text-green-600" : "text-red-600";
  };

  if (error) return <Card><CardContent>Error: {error}</CardContent></Card>;

  const showLoadingOrNoData = loading || !ocrTimePanel || !ocrTimePanel.data || ocrTimePanel.data.length === 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0 pb-2">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="mr-2">⏱️</span>
            OCR 검사 결과
          </CardTitle>
          <Input
            placeholder="IP 검색..."
            value={displayedSearchTerm}
            onChange={handleInputChange}
            className="text-xs h-8"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        {showLoadingOrNoData ? (
          loading && searchTerm ? (
            renderLoadingSkeleton()
          ) : (
            <div className="text-center py-4 text-gray-500">
              <div className="text-xs">{loading ? "Loading..." : "데이터가 없습니다"}</div>
            </div>
          )
        ) : (
          <div className="h-full overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="text-xs py-2">IP</TableHead>
                  <TableHead className="text-xs text-center py-2">OCR</TableHead>
                  <TableHead className="text-xs text-center py-2">수집</TableHead>
                  <TableHead className="text-xs text-center py-2">일치</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ocrTimePanel.data.map((item, index) => {
                  const ocrTimeValue = item.value[1];
                  const serverTimestamp = ocrServerTimestampPanel?.data.find(d => d.metric.instance === item.metric.instance)?.value[1];
                  
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
        <p className="text-xs text-gray-500 mt-2">실시간 업데이트</p>
      </CardContent>
    </Card>
  );
}