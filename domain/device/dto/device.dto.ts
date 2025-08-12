import type { Device } from '../model/device';
import type { BuildingType, DeviceType, DeviceStatus } from '@/types/device';

// Device 조회 응답 DTO
export interface DeviceResponse extends Device {}

// Device 생성 요청 DTO
export interface DeviceCreateRequest {
  device_name: string;
  ip?: string;
  device_type: DeviceType;
  building_type: BuildingType;
  floor: number;
  position_x: number;
  position_z: number;
  location?: string;
  description?: string;
}

// Device 업데이트 요청 DTO
export interface DeviceUpdateRequest {
  ip?: string;
  device_type?: DeviceType;
  status?: DeviceStatus;
  building_type?: BuildingType;
  floor?: number;
  position_x?: number;
  position_z?: number;
  location?: string;
  description?: string;
} 