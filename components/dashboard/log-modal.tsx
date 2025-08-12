'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, WifiOff, Clock, Server, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { PrometheusPanelData } from '@/lib/prometheus-api';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrometheusPanelData[];
}

interface AbnormalDevice {
  id: string;
  name: string;
  type: 'health-failure' | 'ai-failure' | 'ocr-mismatch';
  status: string;
  value?: string;
  timestamp?: string;
  instance?: string;
  details?: any;
}

export function LogModal({ isOpen, onClose, data }: LogModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 비정상 디바이스 목록 생성 (3가지 카테고리만)
  const abnormalDevices = useMemo(() => {
    const devices: AbnormalDevice[] = [];

    // 1. 헬스체크 실패 디바이스
    const deviceHealth = data.find(d => d.id === 'device-health');
    if (deviceHealth?.data) {
      deviceHealth.data
        .filter((item: any) => item.value && parseFloat(item.value[1]) === 0)
        .forEach((item: any, index: number) => {
          const instance = item.metric?.instance || `device-${index + 1}`;
          devices.push({
            id: `health-failure-${index}`,
            name: instance,
            type: 'health-failure',
            status: '디바이스 연결 실패',
            value: item.value?.[1] || '0',
            timestamp: item.value?.[0] ? new Date(item.value[0] * 1000).toLocaleString('ko-KR') : undefined,
            instance: instance,
            details: item.metric
          });
        });
    }

    // 2. AI 검사 실패 디바이스
    const aiFailedDevices = data.find(d => d.id === 'ai-failed-devices');
    if (aiFailedDevices?.data) {
      aiFailedDevices.data.forEach((item: any, index: number) => {
        const instance = item.metric?.instance || `device-${index + 1}`;
        devices.push({
          id: `ai-failure-${index}`,
          name: instance,
          type: 'ai-failure',
          status: 'AI 검사 실패',
          value: item.value?.[1] || '0',
          timestamp: item.value?.[0] ? new Date(item.value[0] * 1000).toLocaleString('ko-KR') : undefined,
          instance: instance,
          details: item.metric
        });
      });
    }

    // 3. OCR 시간 불일치
    const ocrMismatch = data.find(d => d.id === 'ocr-mismatch-list');
    if (ocrMismatch?.data) {
      ocrMismatch.data.forEach((item: any, index: number) => {
        const instance = item.metric?.instance || `device-${index + 1}`;
        devices.push({
          id: `ocr-mismatch-${index}`,
          name: instance,
          type: 'ocr-mismatch',
          status: 'OCR 시간 불일치',
          value: item.value?.[1] || '0',
          timestamp: item.value?.[0] ? new Date(item.value[0] * 1000).toLocaleString('ko-KR') : undefined,
          instance: instance,
          details: item.metric
        });
      });
    }

    return devices.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [data]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'health-failure':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      case 'ai-failure':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'ocr-mismatch':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'health-failure':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ai-failure':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ocr-mismatch':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 탭별 필터링
  const filteredDevices = useMemo(() => {
    if (activeTab === 'all') return abnormalDevices;
    return abnormalDevices.filter(device => device.type === activeTab);
  }, [abnormalDevices, activeTab]);

  // 페이징 처리
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDevices.slice(startIndex, endIndex);
  }, [filteredDevices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  // 탭 변경 시 페이지 리셋
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getTabCount = (type: string) => {
    if (type === 'all') return abnormalDevices.length;
    return abnormalDevices.filter(device => device.type === type).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            디바이스 이상 로그
          </DialogTitle>
          <DialogDescription>
            헬스체크 실패, AI 검사 실패, OCR 불일치 디바이스 로그를 확인하세요
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              전체
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('all')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="health-failure" className="flex items-center gap-1">
              헬스체크 실패
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('health-failure')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-failure" className="flex items-center gap-1">
              AI 검사 실패
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('ai-failure')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ocr-mismatch" className="flex items-center gap-1">
              OCR 불일치
              <Badge variant="secondary" className="ml-1 text-xs">
                {getTabCount('ocr-mismatch')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full pr-4">
              {paginatedDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Server className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">이상이 감지된 디바이스가 없습니다</p>
                  <p className="text-sm mt-1">모든 디바이스가 정상적으로 작동 중입니다 ✅</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getDeviceIcon(device.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {device.name}
                              </h3>
                              <Badge className={getStatusColor(device.type)}>
                                {device.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              {device.value && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">값:</span>
                                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {device.value}
                                  </code>
                                </div>
                              )}
                              {device.timestamp && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">시간:</span>
                                  <span>{device.timestamp}</span>
                                </div>
                              )}
                              {device.instance && (
                                <div className="flex items-center gap-2 col-span-2">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-medium">인스턴스:</span>
                                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {device.instance}
                                  </code>
                                </div>
                              )}
                            </div>

                            {device.details && Object.keys(device.details).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <details className="cursor-pointer">
                                  <summary className="text-xs text-gray-500 hover:text-gray-700">
                                    세부 정보 보기
                                  </summary>
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                    <pre className="whitespace-pre-wrap font-mono">
                                      {JSON.stringify(device.details, null, 2)}
                                    </pre>
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 페이징 컨트롤 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500">
                총 {filteredDevices.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredDevices.length)}개 표시
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  이전
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                  {totalPages > 5 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  다음
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}