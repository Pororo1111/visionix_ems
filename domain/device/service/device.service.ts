import type { Device } from '../model/device';
import * as repository from '../repository/device.repository';
import type { DeviceCreateRequest } from '../dto/device.dto';

// 디바이스 페이징 조회 서비스
export async function listDevices(page: number, limit: number): Promise<{ items: Device[]; total: number }> {
  return repository.getDevicesWithPaging(page, limit);
}

// 디바이스 생성 서비스
export async function registerDevice(data: DeviceCreateRequest): Promise<Device> {
  // online이 undefined면 false로, created_at은 DB에서 자동 생성
  return repository.createDevice({
    device_id: data.ip, // device_id를 ip로 지정(혹은 별도 처리 필요시 수정)
    ip: data.ip,
    location: data.location,
    online: data.online ?? false,
  });
}

// 디바이스 단건 조회 서비스
export async function getDevice(deviceId: string): Promise<Device | undefined> {
  return repository.getDeviceById(deviceId);
} 