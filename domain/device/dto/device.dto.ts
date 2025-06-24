import type { Device, NewDevice } from '../model/device';

// Device 조회 응답 DTO
export interface DeviceResponse extends Device {}

// Device 생성 요청 DTO
export interface DeviceCreateRequest extends NewDevice {} 