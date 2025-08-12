import type { Device } from "../model/device";
import * as repository from "../repository/device.repository";
import type { DeviceCreateRequest } from "../dto/device.dto";

// 디바이스 페이징 조회 서비스
export async function listDevices(
    page: number,
    limit: number
): Promise<{ items: Device[]; total: number }> {
    return repository.getDevicesWithPaging(page, limit);
}

// 디바이스 생성 서비스
export async function registerDevice(
    data: DeviceCreateRequest
): Promise<Device> {
    return repository.createDevice({
        device_name: data.device_name,
        ip: data.ip || null,
        device_type: data.device_type,
        building_type: data.building_type,
        floor: data.floor,
        position_x: data.position_x,
        position_z: data.position_z,
        location: data.location || null,
        description: data.description || null,
        status: 'inactive', // 기본값
        is_registered_via_3d: true, // 3D 등록 플래그
    });
}

// 디바이스 단건 조회 서비스 (이름으로)
export async function getDevice(deviceName: string): Promise<Device | undefined> {
    return repository.getDeviceByName(deviceName);
}

// 전체 디바이스 조회 서비스
export async function getAllDevices(): Promise<Device[]> {
    return repository.getAllDevices();
}

// 전체 디바이스 IP만 반환
export async function getAllDeviceIps(): Promise<string[]> {
    const devices = await repository.getAllDevices();
    return devices
        .map((d) => d.ip)
        .filter((ip): ip is string => typeof ip === "string" && ip.length > 0);
}

// 디바이스 삭제 서비스
export async function removeDevice(deviceName: string): Promise<boolean> {
    return repository.deleteDevice(deviceName);
}

// 디바이스 정보 수정 서비스
export async function updateDevice(
    deviceName: string,
    data: Partial<Omit<Device, 'device_name' | 'created_at'>>
): Promise<boolean> {
    return repository.updateDevice(deviceName, data);
}
