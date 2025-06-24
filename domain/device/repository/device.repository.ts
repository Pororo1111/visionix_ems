import { db } from '@/lib/db';
import { device } from '../model/device';
import type { Device, NewDevice } from '../model/device';
import { eq } from 'drizzle-orm';

// 디바이스 전체 조회
export async function getAllDevices(): Promise<Device[]> {
  return db.select().from(device);
}

// 디바이스 생성
export async function createDevice(data: NewDevice): Promise<Device> {
  const [created] = await db.insert(device).values(data).returning();
  return created;
}

// 디바이스 단건 조회
export async function getDeviceById(deviceId: string): Promise<Device | undefined> {
  const [found] = await db.select().from(device).where(eq(device.device_id, deviceId));
  return found;
}

// 디바이스 삭제 등 추가 구현 필요시 여기에 작성 