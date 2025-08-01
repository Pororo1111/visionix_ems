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
    // device_id와 ip를 분리하여 저장
    return repository.createDevice({
        device_id: data.device_id,
        ip: data.ip,
        location: data.location,
    });
}

// 디바이스 단건 조회 서비스
export async function getDevice(deviceId: string): Promise<Device | undefined> {
    return repository.getDeviceById(deviceId);
}

// 전체 디바이스 IP만 반환
export async function getAllDeviceIps(): Promise<string[]> {
    const devices = await repository.getAllDevices();
    return devices
        .map((d) => d.ip)
        .filter((ip): ip is string => typeof ip === "string" && ip.length > 0);
}

// 디바이스 삭제 서비스
export async function removeDevice(deviceId: string): Promise<boolean> {
    return repository.deleteDevice(deviceId);
}

// 디바이스 정보 수정 서비스
export async function updateDevice(
    deviceId: string,
    data: Partial<Device>
): Promise<boolean> {
    return repository.updateDevice(deviceId, data);
}
