'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle } from 'lucide-react';
import { LogModal } from './log-modal';
import { PrometheusPanelData } from '@/lib/prometheus-api';

interface LogButtonProps {
  data: PrometheusPanelData[];
}

export function LogButton({ data }: LogButtonProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // 비정상 디바이스 수 계산 (3가지 카테고리)
  const getAbnormalDeviceCount = () => {
    let count = 0;
    
    // 1. 헬스체크 실패 디바이스
    const deviceHealth = data.find(d => d.id === 'device-health');
    if (deviceHealth?.data) {
      const healthFailures = deviceHealth.data.filter((item: any) => 
        item.value && parseFloat(item.value[1]) === 0
      );
      count += healthFailures.length;
    }
    
    // 2. AI 검사 실패 디바이스
    const aiFailedDevices = data.find(d => d.id === 'ai-failed-devices');
    if (aiFailedDevices?.data) {
      count += aiFailedDevices.data.length;
    }
    
    // 3. OCR 불일치 디바이스
    const ocrMismatch = data.find(d => d.id === 'ocr-mismatch-list');
    if (ocrMismatch?.data) {
      count += ocrMismatch.data.length;
    }
    
    return count;
  };

  const abnormalCount = getAbnormalDeviceCount();

  return (
    <>
      {/* 우하단 고정 로그 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsLogModalOpen(true)}
          className={`
            relative h-14 w-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105
            ${abnormalCount > 0 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
          `}
          title={`로그 보기 (비정상 디바이스: ${abnormalCount}개)`}
        >
          <div className="flex flex-col items-center justify-center">
            {abnormalCount > 0 ? (
              <AlertTriangle size={20} />
            ) : (
              <FileText size={20} />
            )}
            {abnormalCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                {abnormalCount > 99 ? '99+' : abnormalCount}
              </div>
            )}
          </div>
        </Button>
      </div>

      {/* 로그 모달 */}
      <LogModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        data={data}
      />
    </>
  );
}