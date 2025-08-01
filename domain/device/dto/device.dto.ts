import type { Device } from '../model/device';

// Device 조회 응답 DTO
export interface DeviceResponse extends Device {}

// Device 생성 요청 DTO
export interface DeviceCreateRequest {
  device_id: string;
  ip: string;
  location: string;
} 