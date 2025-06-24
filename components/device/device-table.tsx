"use client";
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Device {
  device_id: string;
  ip: string;
  location: string;
  created_at: string;
  online: boolean;
}

interface DeviceTableProps {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function DeviceTable({ devices, total, page, limit, onPageChange, className }: DeviceTableProps) {
  const totalPages = Math.ceil(total / limit);
  return (
    <Card className={className + ' pb-4'}>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Device ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">IP 주소</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">설치 위치</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">상태</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">생성일</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">등록된 디바이스가 없습니다.</td>
              </tr>
            ) : (
              devices.map((d, idx) => (
                <tr
                  key={d.device_id}
                  className={
                    'border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors' +
                    (idx % 2 === 1 ? ' bg-gray-50 dark:bg-gray-900' : '')
                  }
                >
                  <td className="px-4 py-2 font-mono text-sm">{d.device_id}</td>
                  <td className="px-4 py-2">{d.ip}</td>
                  <td className="px-4 py-2">{d.location}</td>
                  <td className="px-4 py-2">
                    {d.online ? (
                      <Badge variant="secondary">온라인</Badge>
                    ) : (
                      <Badge variant="destructive">오프라인</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 border-t bg-white dark:bg-gray-950 sticky bottom-0 left-0 right-0 z-10 px-4 py-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">총 {total}개</div>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? 'secondary' : 'outline'}
              onClick={() => onPageChange(i + 1)}
              disabled={page === i + 1}
              className="px-3 py-1 text-sm"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
} 