import type { Device } from '../model/device';

// Device 조회 응답 DTO
export interface DeviceResponse extends Device {}

// Device 생성 요청 DTO
export interface DeviceCreateRequest {
  ip: string;
  location: string;
  online?: boolean; // 기본값 false
} 