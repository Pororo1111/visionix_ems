"use client";
import { Table } from '@/components/ui/table';

interface Device {
  device_id: string;
  serial_no: string;
  location: string;
  status_interval: number;
  activated_at: string | null;
  deactivated_at: string | null;
}

interface DeviceTableProps {
  devices: Device[];
}

export default function DeviceTable({ devices }: DeviceTableProps) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Device ID</th>
          <th>Serial No</th>
          <th>설치 위치</th>
          <th>상태 주기(초)</th>
          <th>설치 시각</th>
          <th>해제 시각</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((d) => (
          <tr key={d.device_id}>
            <td>{d.device_id}</td>
            <td>{d.serial_no}</td>
            <td>{d.location}</td>
            <td>{d.status_interval}</td>
            <td>{d.activated_at ?? '-'}</td>
            <td>{d.deactivated_at ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
} 