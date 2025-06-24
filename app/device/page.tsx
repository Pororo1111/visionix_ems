"use client";
import React, { useEffect, useState, useTransition } from 'react';
import DeviceTable from '@/components/device/device-table';
import DeviceForm from '@/components/device/device-form';

const LIMIT = 10;

export default function DevicePage() {
  const [devices, setDevices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, startTransition] = useTransition();

  const fetchDevices = async (page: number) => {
    const res = await fetch(`/api/device?page=${page}&limit=${LIMIT}`);
    const data = await res.json();
    setDevices(data.items);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchDevices(page);
  }, [page]);

  const handleCreated = () => {
    startTransition(() => fetchDevices(page));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 relative min-h-[600px]">
      <h1 className="text-2xl font-bold mb-6">디바이스 관리</h1>
      <DeviceForm onCreated={handleCreated} />
      <div className="relative">
        <div className={loading ? 'pointer-events-none opacity-50 transition-all' : ''}>
          <DeviceTable devices={devices} total={total} page={page} limit={LIMIT} onPageChange={setPage} className="" />
        </div>
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center z-30 rounded-lg">
            <span className="text-lg text-gray-500 animate-pulse">업데이트 중...</span>
          </div>
        )}
      </div>
    </div>
  );
} 