import { db } from "@/lib/db";
import { device } from "../model/device";
import type { Device } from "../model/device";
import { eq, desc } from "drizzle-orm";

// 디바이스 전체 조회
export async function getAllDevices(): Promise<Device[]> {
    return db.select().from(device);
}

// 페이징 디바이스 조회
export async function getDevicesWithPaging(
    page: number,
    limit: number
): Promise<{ items: Device[]; total: number }> {
    const offset = (page - 1) * limit;
    const totalResult = await db.select().from(device);
    const total = totalResult.length;
    const items = await db
        .select()
        .from(device)
        .orderBy(desc(device.created_at))
        .limit(limit)
        .offset(offset);
    return { items, total };
}

// 디바이스 생성
export async function createDevice(
    data: Omit<Device, "created_at">
): Promise<Device> {
    const [created] = await db.insert(device).values(data).returning();
    return created;
}

// 디바이스 단건 조회
export async function getDeviceById(
    deviceId: string
): Promise<Device | undefined> {
    const [found] = await db
        .select()
        .from(device)
        .where(eq(device.device_id, deviceId));
    return found;
}

// 디바이스 삭제
export async function deleteDevice(deviceId: string): Promise<boolean> {
    const [deleted] = await db
        .delete(device)
        .where(eq(device.device_id, deviceId))
        .returning();
    return !!deleted;
}

// 디바이스 정보 수정
export async function updateDevice(
    deviceId: string,
    data: Partial<Device>
): Promise<boolean> {
    const [updated] = await db
        .update(device)
        .set({
            ip: data.ip,
            location: data.location,
        })
        .where(eq(device.device_id, deviceId))
        .returning();
    return !!updated;
}
