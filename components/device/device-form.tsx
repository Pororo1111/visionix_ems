"use client";
import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeviceForm({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState({
    device_id: '',
    ip: '',
    location: '',
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
      body: JSON.stringify(form),
    });
    setForm({ device_id: '', ip: '', location: '' });
    if (onCreated) startTransition(() => onCreated());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="device_id">Device ID</Label>
        <Input id="device_id" name="device_id" value={form.device_id} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="ip">IP 주소</Label>
        <Input id="ip" name="ip" value={form.ip} onChange={handleChange} required />
      </div>
      <div className="col-span-2">
        <Label htmlFor="location">설치 위치</Label>
        <Input id="location" name="location" value={form.location} onChange={handleChange} required />
      </div>
      <div className="col-span-2 text-right">
        <Button type="submit" disabled={loading}>{loading ? '등록 중...' : '디바이스 등록'}</Button>
      </div>
    </form>
  );
} 