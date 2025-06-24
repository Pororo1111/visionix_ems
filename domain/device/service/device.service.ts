import type { Device } from '../model/device';
import * as repository from '../repository/device.repository';
import type { DeviceCreateRequest } from '../dto/device.dto';

// 디바이스 페이징 조회 서비스
export async function listDevices(page: number, limit: number): Promise<{ items: Device[]; total: number }> {
  return repository.getDevicesWithPaging(page, limit);
}

// 디바이스 생성 서비스
export async function registerDevice(data: DeviceCreateRequest): Promise<Device> {
  // device_id와 ip를 분리하여 저장
  return repository.createDevice({
    device_id: data.device_id,
    ip: data.ip,
    location: data.location,
    online: data.online ?? false,
  });
}

// 디바이스 단건 조회 서비스
export async function getDevice(deviceId: string): Promise<Device | undefined> {
  return repository.getDeviceById(deviceId);
} 