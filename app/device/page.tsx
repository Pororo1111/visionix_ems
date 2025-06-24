import DeviceTable from '@/components/device/device-table';
import DeviceForm from '@/components/device/device-form';

// 서버 컴포넌트: 디바이스 목록을 서버에서 fetch
async function getDevices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/device`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function DevicePage() {
  const devices = await getDevices();
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">디바이스 관리</h1>
      <DeviceForm />
      <DeviceTable devices={devices} />
    </div>
  );
} 