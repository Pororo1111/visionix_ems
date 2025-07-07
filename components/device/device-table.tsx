"use client";
import { useState } from 'react';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Device {
  device_id: string;
  ip: string;
  location: string;
  created_at: string;
}

interface DeviceTableProps {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onDeviceDeleted?: () => void;
  className?: string;
}

export default function DeviceTable({ devices, total, page, limit, onPageChange, onDeviceDeleted, className }: DeviceTableProps) {
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (deviceId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/device?deviceId=${deviceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('디바이스가 삭제되었습니다.');
        onDeviceDeleted?.();
      } else {
        toast.error(data.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      toast.error('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setDeletingDeviceId(null);
    }
  };

  return (
    <Card className={className + ' pb-4'}>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Device ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">IP 주소</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">설치 위치</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">생성일</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">작업</th>
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
                  <td className="px-4 py-2 whitespace-nowrap">{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>디바이스 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{d.device_id}</strong> 디바이스를 삭제하시겠습니까?
                            <br />
                            이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(d.device_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
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