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
    data: Omit<Device, "created_at" | "updated_at">
): Promise<Device> {
    const [created] = await db.insert(device).values({
        ...data,
        updated_at: new Date()
    }).returning();
    return created;
}

// 디바이스 단건 조회 (이름으로)
export async function getDeviceByName(
    deviceName: string
): Promise<Device | undefined> {
    const [found] = await db
        .select()
        .from(device)
        .where(eq(device.device_name, deviceName));
    return found;
}

// 디바이스 삭제
export async function deleteDevice(deviceName: string): Promise<boolean> {
    const [deleted] = await db
        .delete(device)
        .where(eq(device.device_name, deviceName))
        .returning();
    return !!deleted;
}

// 디바이스 정보 수정
export async function updateDevice(
    deviceName: string,
    data: Partial<Omit<Device, 'device_name' | 'created_at'>>
): Promise<boolean> {
    const updateData: any = {};
    
    // 업데이트 가능한 필드들만 설정
    if (data.ip !== undefined) updateData.ip = data.ip;
    if (data.device_type !== undefined) updateData.device_type = data.device_type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.building_type !== undefined) updateData.building_type = data.building_type;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.position_x !== undefined) updateData.position_x = data.position_x;
    if (data.position_z !== undefined) updateData.position_z = data.position_z;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_registered_via_3d !== undefined) updateData.is_registered_via_3d = data.is_registered_via_3d;
    
    // 수정일 업데이트
    updateData.updated_at = new Date();
    
    const [updated] = await db
        .update(device)
        .set(updateData)
        .where(eq(device.device_name, deviceName))
        .returning();
    return !!updated;
}
