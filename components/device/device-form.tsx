"use client";
import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeviceForm() {
  const [form, setForm] = useState({
    device_id: '',
    serial_no: '',
    location: '',
    status_interval: 60,
  });
  const [loading, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status_interval: Number(form.status_interval) }),
    });
    setForm({ device_id: '', serial_no: '', location: '', status_interval: 60 });
    // 새로고침(SSR 목록 반영)
    startTransition(() => window.location.reload());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="device_id">Device ID</Label>
        <Input id="device_id" name="device_id" value={form.device_id} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="serial_no">Serial No</Label>
        <Input id="serial_no" name="serial_no" value={form.serial_no} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="location">설치 위치</Label>
        <Input id="location" name="location" value={form.location} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="status_interval">상태 전송 주기(초)</Label>
        <Input id="status_interval" name="status_interval" type="number" value={form.status_interval} onChange={handleChange} required />
      </div>
      <div className="col-span-2 text-right">
        <Button type="submit" disabled={loading}>{loading ? '등록 중...' : '디바이스 등록'}</Button>
      </div>
    </form>
  );
} 