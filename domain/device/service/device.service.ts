import type { Device, NewDevice } from '../model/device';
import * as repository from '../repository/device.repository';

// 디바이스 전체 조회 서비스
export async function listDevices(): Promise<Device[]> {
  return repository.getAllDevices();
}

// 디바이스 생성 서비스
export async function registerDevice(data: NewDevice): Promise<Device> {
  // TODO: 비즈니스 검증 로직 추가 가능
  return repository.createDevice(data);
}

// 디바이스 단건 조회 서비스
export async function getDevice(deviceId: string): Promise<Device | undefined> {
  return repository.getDeviceById(deviceId);
} 