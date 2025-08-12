"use client";
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CoordinatePickerModal } from './coordinate-picker-modal';
import { 
  BuildingType, 
  DeviceType, 
  DeviceStatus, 
  BUILDING_INFO,
  DEVICE_TYPE_LABELS,
  DEVICE_STATUS_LABELS
} from '@/types/device';

interface DeviceEditFormProps {
    device: {
        device_name: string;
        ip?: string;
        device_type: DeviceType;
        status: DeviceStatus;
        building_type: BuildingType;
        floor: number;
        position_x: number;
        position_z: number;
        location?: string;
        description?: string;
        is_registered_via_3d: boolean;
    };
    onUpdated?: () => void;
    onCancel?: () => void;
}

export default function DeviceEditForm({
    device,
    onUpdated,
    onCancel,
}: DeviceEditFormProps) {
    const [form, setForm] = useState({
        device_type: device.device_type,
        status: device.status,
        building_type: device.building_type,
        floor: device.floor,
        position_x: device.position_x,
        position_z: device.position_z,
        ip: device.ip || '',
        location: device.location || '',
        description: device.description || '',
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
        setIsCoordinatePickerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.ip) {
            alert('IP 주소는 필수 입력 항목입니다.');
            return;
        }
        try {
            const response = await fetch(`/api/device?deviceName=${encodeURIComponent(device.device_name)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            
            if (response.ok) {
                if (onUpdated) startTransition(() => onUpdated());
            } else {
                const error = await response.json();
                alert(error.error || '수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('수정 오류:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900"
        >
            {/* 디바이스 이름 (읽기 전용) */}
            <div className="col-span-2">
                <Label htmlFor="device_name">디바이스 이름</Label>
                <Input
                    id="device_name"
                    value={device.device_name}
                    disabled
                    className="bg-gray-100 dark:bg-gray-700"
                />
            </div>

            {/* 디바이스 타입 */}
            <div>
                <Label htmlFor="device_type">디바이스 타입</Label>
                <Select value={form.device_type} onValueChange={(value) => handleSelectChange('device_type', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DEVICE_TYPE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 상태 */}
            <div>
                <Label htmlFor="status">상태</Label>
                <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DEVICE_STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 건물 */}
            <div>
                <Label htmlFor="building_type">건물</Label>
                <Select value={form.building_type} onValueChange={(value) => handleSelectChange('building_type', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(BUILDING_INFO).map(([key, building]) => (
                            <SelectItem key={key} value={key}>{building.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 층수 */}
            <div>
                <Label htmlFor="floor">층수</Label>
                <Input
                    id="floor"
                    name="floor"
                    type="number"
                    value={form.floor}
                    onChange={handleChange}
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

            {/* IP 주소 */}
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

            {/* 위치 정보 */}
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

            {/* 설명 */}
            <div className="col-span-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div className="col-span-2 flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    취소
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "수정 중..." : "✅ 수정 완료"}
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