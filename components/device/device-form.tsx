"use client";
import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CoordinatePickerModal } from './coordinate-picker-modal';
import { 
  BuildingType, 
  DeviceType, 
  BUILDING_INFO,
  DEVICE_TYPE_LABELS
} from '@/types/device';

export default function DeviceForm({ onCreated }: { onCreated?: () => void }) {
  const [form, setForm] = useState({
    device_name: '',
    device_type: '' as DeviceType | '',
    building_type: '' as BuildingType | '',
    floor: 1,
    position_x: 50,
    position_z: 50,
    ip: '',
    location: '',
    description: '',
  });
  const [loading, startTransition] = useTransition();
  const [isCoordinatePickerOpen, setIsCoordinatePickerOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleCoordinateSelect = (x: number, z: number, floor: number) => {
    setForm({ 
      ...form, 
      position_x: Math.round(x * 10) / 10, // 소수점 1자리로 반올림
      position_z: Math.round(z * 10) / 10,
      floor: floor
    });
    setIsCoordinatePickerOpen(false);
  };

  const handleOpenCoordinatePicker = () => {
    if (!form.building_type) {
      alert('먼저 건물을 선택해주세요. 🏢');
      return;
    }
    setIsCoordinatePickerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.device_name || !form.device_type || !form.building_type || !form.ip) {
      alert('필수 필드를 모두 입력해주세요. (디바이스 이름, 타입, 건물, IP 주소)');
      return;
    }
    
    try {
      const response = await fetch('/api/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        setForm({
          device_name: '',
          device_type: '' as DeviceType | '',
          building_type: '' as BuildingType | '',
          floor: 1,
          position_x: 50,
          position_z: 50,
          ip: '',
          location: '',
          description: '',
        });
        if (onCreated) startTransition(() => onCreated());
      } else {
        const error = await response.json();
        alert(error.error || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 오류:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-2 gap-4 p-6 border rounded-lg bg-white dark:bg-gray-800">
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">3D 지도 기반 디바이스 등록</h3>
      </div>
      
      {/* 기본 정보 */}
      <div>
        <Label htmlFor="device_name">디바이스 이름 *</Label>
        <Input 
          id="device_name" 
          name="device_name" 
          value={form.device_name} 
          onChange={handleChange} 
          placeholder="터미널1-1층-센서-01" 
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="device_type">디바이스 타입 *</Label>
        <Select value={form.device_type} onValueChange={(value) => handleSelectChange('device_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="타입 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 위치 정보 */}
      <div>
        <Label htmlFor="building_type">건물 *</Label>
        <Select value={form.building_type} onValueChange={(value) => handleSelectChange('building_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="건물 선택" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BUILDING_INFO).map(([key, building]) => (
              <SelectItem key={key} value={key}>{building.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="floor">층수</Label>
        <Input 
          id="floor" 
          name="floor" 
          type="number" 
          value={form.floor} 
          onChange={handleChange}
          placeholder="1 (지하는 음수)"
        />
      </div>

      {/* 3D 좌표 */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-2">
          <Label>3D 좌표 설정</Label>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleOpenCoordinatePicker}
            className="text-sm h-8 px-3"
          >
            🎯 3D 뷰에서 좌표 선택
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="position_x">X 좌표 (0-100)</Label>
            <Input 
              id="position_x" 
              name="position_x" 
              type="number" 
              min="0" 
              max="100" 
              step="0.1"
              value={form.position_x} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <Label htmlFor="position_z">Z 좌표 (0-100)</Label>
            <Input 
              id="position_z" 
              name="position_z" 
              type="number" 
              min="0" 
              max="100" 
              step="0.1"
              value={form.position_z} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div>
        <Label htmlFor="ip">IP 주소 *</Label>
        <Input 
          id="ip" 
          name="ip" 
          value={form.ip} 
          onChange={handleChange} 
          placeholder="192.168.1.100"
          required
        />
      </div>

      <div>
        <Label htmlFor="location">위치 정보 (선택사항)</Label>
        <Input 
          id="location" 
          name="location" 
          value={form.location} 
          onChange={handleChange}
          placeholder="상세 위치 설명" 
        />
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">설명 (선택사항)</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={form.description} 
          onChange={handleChange}
          placeholder="디바이스에 대한 추가 설명을 입력하세요"
          rows={3}
        />
      </div>

      <div className="col-span-2 text-right">
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? '등록 중...' : '🎯 3D 디바이스 등록'}
        </Button>
      </div>

      {/* 좌표 선택 모달 */}
      {form.building_type && (
        <CoordinatePickerModal
          isOpen={isCoordinatePickerOpen}
          onClose={() => setIsCoordinatePickerOpen(false)}
          onCoordinateSelect={handleCoordinateSelect}
          buildingType={form.building_type as BuildingType}
          currentFloor={form.floor}
        />
      )}
    </form>
  );
} 